import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content } = body;
    
    console.log('Gelen HTML içeriği:', content);
    
    return NextResponse.json({ 
      success: true, 
      originalContent: content,
      message: 'HTML içeriği alındı'
    });
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'İstek işlenirken bir hata oluştu' 
    }, { status: 500 });
  }
} 