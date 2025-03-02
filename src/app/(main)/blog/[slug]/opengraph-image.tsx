import { ImageResponse } from 'next/og'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'edge'
export const alt = 'Blog Post'
export const contentType = 'image/png'
export const size = {
  width: 1200,
  height: 630,
}

interface Category {
  name: string;
  color: string;
}

interface PostWithCategory {
  title: string;
  excerpt?: string;
  featured_image?: string;
  categories: Category;
}

export default async function Image({ params }: { params: { slug: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({
      cookies: () => cookieStore
    })

    const { data: post } = await supabase
      .from('posts')
      .select('title, excerpt, featured_image, categories:category_id(name, color)')
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single()

    if (!post) {
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
            Blog Yazısı Bulunamadı
          </div>
        ),
        { ...size }
      )
    }

    const typedPost = post as unknown as PostWithCategory;
    const category = typedPost.categories;

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 60,
            color: 'white',
            background: '#111827',
            backgroundImage: typedPost.featured_image ? `url(${typedPost.featured_image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
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
              background: 'linear-gradient(to bottom, rgba(17, 24, 39, 0.5), rgba(17, 24, 39, 0.95))',
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
            {category && (
              <div
                style={{
                  fontSize: 24,
                  color: 'white',
                  background: category.color || '#8B5CF6',
                  padding: '8px 24px',
                  borderRadius: 50,
                  marginBottom: 30,
                  display: 'inline-block',
                  width: 'fit-content',
                }}
              >
                {category.name}
              </div>
            )}
            <div
              style={{
                fontSize: 60,
                fontWeight: 'bold',
                marginBottom: 20,
                lineHeight: 1.2,
              }}
            >
              {typedPost.title}
            </div>
            {typedPost.excerpt && (
              <div
                style={{
                  fontSize: 30,
                  opacity: 0.8,
                  marginBottom: 40,
                }}
              >
                {typedPost.excerpt.substring(0, 100)}
                {typedPost.excerpt.length > 100 ? '...' : ''}
              </div>
            )}
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
          Blog
        </div>
      ),
      { ...size }
    )
  }
} 