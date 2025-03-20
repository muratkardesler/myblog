import { NextResponse } from 'next/server';

// Oturum önbelleğini temizlemek için API endpoint
export async function POST() {
  try {
    // Bu fonksiyon, tarayıcının Supabase ile ilgili önbelleklerini temizlemek için kullanılır
    // Frontend tarafından çağrılır ve tarayıcı oturum durumunu yeniler
    
    // CORS başlıkları ekle
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Önbellek temizleme isteği alındı. Tarayıcınızın önbelleği temizlenecek.'
      }, 
      { 
        status: 200, 
        headers 
      }
    );
  } catch (error) {
    console.error('Önbellek temizleme hatası:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Önbellek temizlenirken bir hata oluştu.'
      }, 
      { 
        status: 500 
      }
    );
  }
}

export async function OPTIONS() {
  // CORS ön kontrol isteği için yanıt
  return NextResponse.json(
    {}, 
    { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
} 