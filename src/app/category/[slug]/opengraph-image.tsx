import { ImageResponse } from 'next/og'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'edge'
export const alt = 'Kategori Sayfası'
export const contentType = 'image/png'
export const size = {
  width: 1200,
  height: 630,
}

export default async function Image({ params }: { params: { slug: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({
      cookies: () => cookieStore
    })

    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', params.slug)
      .single()

    if (!category) {
      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              fontSize: 60,
              color: 'white',
              background: '#111827',
              width: '100%',
              height: '100%',
              padding: '50px 200px',
              textAlign: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            Kategori Bulunamadı
          </div>
        ),
        { ...size }
      )
    }

    // Kategori yazılarını say
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id)
      .eq('status', 'published')

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 60,
            color: 'white',
            background: '#111827',
            backgroundImage: 'linear-gradient(to bottom right, #1f2937, #111827)',
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.3), rgba(17, 24, 39, 0.9))',
              zIndex: 1,
            }}
          />

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '50px 80px',
              width: '100%',
              height: '100%',
              zIndex: 2,
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 32,
                color: 'white',
                background: category.color || '#8B5CF6',
                padding: '8px 24px',
                borderRadius: 50,
                marginBottom: 30,
                display: 'inline-block',
                width: 'fit-content',
              }}
            >
              Kategori
            </div>
            <div
              style={{
                fontSize: 80,
                fontWeight: 'bold',
                marginBottom: 20,
                lineHeight: 1.2,
              }}
            >
              {category.name}
            </div>
            <div
              style={{
                fontSize: 36,
                opacity: 0.8,
                marginBottom: 40,
              }}
            >
              Bu kategoride {count || 0} yazı bulunuyor
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: 'auto',
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  opacity: 0.8,
                }}
              >
                muratkardesler.com
              </div>
            </div>
          </div>
        </div>
      ),
      { ...size }
    )
  } catch (error) {
    console.error('Error generating OpenGraph image:', error)
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            fontSize: 60,
            color: 'white',
            background: '#111827',
            width: '100%',
            height: '100%',
            padding: '50px 200px',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          Kategori
        </div>
      ),
      { ...size }
    )
  }
} 