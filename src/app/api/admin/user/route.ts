import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase admin client oluştur (service role ile)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(request: NextRequest) {
  try {
    // URL'den parametreleri al
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Eksik userId parametresi' }, { status: 400 });
    }

    // Bu API'yi yalnızca yetkilendirilmiş kullanıcılar kullanabilir
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Yetkilendirme hatası' }, { status: 401 });
    }

    // Service role ile RLS'yi atlayarak verileri getir
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Kullanıcı bilgisi getirme hatası:', userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Kullanıcı ayarlarını getir
    const { data: userSettings, error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Kullanıcı ayarları getirme hatası:', settingsError);
      // Eğer ayar bulunamadıysa devam et, ciddi bir hata değil
    }

    return NextResponse.json({
      user: userData,
      settings: userSettings
    });
  } catch (error) {
    console.error('API hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 