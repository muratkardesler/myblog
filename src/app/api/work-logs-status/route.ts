import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Bir gün içerisinde girilmesi gereken minimum iş kaydı süresi
const MIN_WORK_DURATION = 1.0; // 1 saat

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // API key kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: API key required' },
        { status: 401 }
      );
    }
    
    // Bugünün tarihini al (UTC)
    const now = new Date();
    
    // Bugünün başlangıcını Türkiye saatine göre hesapla (UTC+3)
    const today = new Date(Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      21,
      0,
      0
    ));
    
    const formattedDate = today.toISOString();
    
    // Debug için tarihleri logla
    console.log('Şu anki tarih:', now);
    console.log('Sorgulanacak tarih:', formattedDate);

    // Bugünün hafta sonu olup olmadığını kontrol et
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    // Tüm aktif kullanıcıları getir
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('is_active', true);

    if (usersError) {
      console.error('Kullanıcılar getirilirken hata:', usersError);
      throw usersError;
    }

    // Bugün iş kaydı girmiş kullanıcıları getir
    const { data: workLogs, error: workLogsError } = await supabase
      .from('work_logs')
      .select('user_id, duration')
      .eq('date', formattedDate);

    if (workLogsError) {
      console.error('İş kayıtları getirilirken hata:', workLogsError);
      throw workLogsError;
    }

    // Debug için verileri logla
    console.log('Aktif kullanıcılar:', users?.length);
    console.log('İş kayıtları:', workLogs?.length);
    console.log('Aktif kullanıcı listesi:', users);
    console.log('İş kayıtları listesi:', workLogs);

    // Her kullanıcının toplam süresini hesapla
    const userTotals = new Map();
    workLogs?.forEach(log => {
      const currentTotal = userTotals.get(log.user_id) || 0;
      userTotals.set(log.user_id, currentTotal + parseFloat(String(log.duration)));
    });

    // Debug için toplam süreleri logla
    console.log('Kullanıcı toplam süreleri:', Object.fromEntries(userTotals));

    // İş kaydı eksik olan kullanıcıları bul
    const results = users
      .filter(user => {
        const totalDuration = userTotals.get(user.id) || 0;
        return totalDuration < 1;
      })
      .map(user => ({
        user_id: user.id,
        email: user.email,
        full_name: user.full_name,
        total_duration: userTotals.get(user.id) || 0
      }));

    // Tüm kullanıcıların iş kaydı tam mı kontrol et
    const allComplete = users.length > 0 && users.every(user => {
      const totalDuration = userTotals.get(user.id) || 0;
      return totalDuration >= 1;
    });

    return NextResponse.json({
      date: formattedDate,
      is_weekend: isWeekend,
      results: results,
      all_complete: allComplete
    });

  } catch (error) {
    console.error('İş takibi durumu kontrol edilirken hata:', error);
    return NextResponse.json(
      { error: 'İş takibi durumu kontrol edilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 