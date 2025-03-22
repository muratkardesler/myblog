import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase server-side client oluştur (environment variables kullanarak)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

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

    // Admin client ile RLS'yi atlayarak verileri getir
    // Service role ile yapılan sorgular RLS politikalarını atlar
    const { data, error } = await supabaseAdmin
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

    // Sonuçları döndür
    return NextResponse.json(data);
  } catch (error) {
    console.error('API hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 