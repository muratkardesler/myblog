import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Bir gün içerisinde girilmesi gereken minimum iş kaydı süresi
const MIN_WORK_DURATION = 1.0; // 1 saat

export async function GET(request: NextRequest) {
  try {
    // Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // API anahtar kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: API key required' },
        { status: 401 }
      );
    }
    
    const apiKey = authHeader.split(' ')[1];
    // Service role key'e eşit mi kontrol et
    if (apiKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid API key' },
        { status: 401 }
      );
    }
    
    // URL'den tarih parametresini al (varsayılan: bugün)
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');
    const checkDate = dateParam ? new Date(dateParam) : new Date();
    
    // Tarih geçerli mi kontrol et
    if (isNaN(checkDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }
    
    // Formatlı tarih (YYYY-MM-DD)
    const formattedDate = checkDate.toISOString().split('T')[0];
    
    // Sadece aktif kullanıcıları getir
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true);
      
    if (usersError) {
      console.error('Kullanıcılar alınırken hata:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }
    
    // Haftasonu ise tüm kullanıcılar için true döndür
    const dayOfWeek = checkDate.getDay(); // 0: Pazar, 6: Cumartesi
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Hafta sonu
      const allComplete = users.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_complete: true, // Hafta sonu olduğu için tam sayılır
        total_duration: 0
      }));
      
      return NextResponse.json({
        date: formattedDate,
        is_weekend: true,
        results: allComplete,
        all_complete: true
      });
    }
    
    // Tüm kullanıcıların bu tarihteki iş kayıtlarını kontrol et
    const results = await Promise.all(
      users.map(async (user) => {
        const { data: workLogs, error: logsError } = await supabase
          .from('work_logs')
          .select('duration')
          .eq('user_id', user.id)
          .eq('date', formattedDate);
          
        if (logsError) {
          console.error(`${user.id} kullanıcısının iş kayıtları alınırken hata:`, logsError);
          return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            is_complete: false,
            total_duration: 0,
            error: 'Failed to fetch work logs'
          };
        }
        
        // Toplam süreyi hesapla
        const totalDuration = workLogs?.reduce((sum, log) => 
          sum + parseFloat(String(log.duration)), 0) || 0;
          
        // İş kaydı tam mı kontrol et (minimum süreye ulaşıldı mı?)
        const isComplete = totalDuration >= MIN_WORK_DURATION;
        
        return {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          is_complete: isComplete,
          total_duration: totalDuration
        };
      })
    );
    
    // Tüm kullanıcılar için sonuçları hazırla
    const incompleteUsers = results.filter(user => !user.is_complete);
    const allComplete = incompleteUsers.length === 0;
    
    return NextResponse.json({
      date: formattedDate,
      is_weekend: false,
      results,
      all_complete: allComplete
    });
    
  } catch (error) {
    console.error('Work logs check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 