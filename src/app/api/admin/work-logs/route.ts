import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase URL'ini kontrol et
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL ortam değişkeni tanımlanmamış');
}

// Service role key'i kontrol et
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY tanımlanmamış, normal yetkilendirme kullanılacak');
}

// Supabase admin client oluştur (service role varsa kullan, yoksa normal client kullan)
const supabaseAdmin = serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

export async function GET(request: NextRequest) {
  try {
    // URL'den parametreleri al
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 });
    }

    // Bu API'yi yalnızca yetkilendirilmiş kullanıcılar kullanabilir
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme hatası' }, { status: 401 });
    }

    // Service role varsa onu kullan, yoksa normal client kullan
    const queryClient = supabaseAdmin || supabase;
    
    // Verileri getir - service role varsa RLS'yi atlar, yoksa normal erişim kullanır
    const { data, error } = await queryClient
      .from('work_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Work logs sorgu hatası:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // RLS'yi atlatamıyorsak (service role yoksa) ve kullanıcı kendi verilerini sorguluyorsa sorun yok
    // Ama farklı bir kullanıcının verilerini alıyorsa ve sonuçlar boşsa uyarı ver
    if (!supabaseAdmin && session.user.id !== userId && (!data || data.length === 0)) {
      console.warn('Kullanıcı başka bir kullanıcının verilerine erişmeye çalışıyor ve service_role eksik');
    }

    // Sonuçları döndür
    return NextResponse.json(data);
  } catch (error) {
    console.error('API hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 