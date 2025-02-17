import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: post } = await supabase
    .from('posts')
    .select('title, content')
    .eq('slug', params.slug)
    .single()

  if (!post) {
    return {
      title: 'Blog Yazısı Bulunamadı',
      description: 'İstediğiniz blog yazısı bulunamadı.'
    }
  }

  return {
    title: post.title,
    description: post.content.substring(0, 160)
  }
}

export async function generateStaticParams() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: posts } = await supabase
    .from('posts')
    .select('slug')
    .eq('status', 'published')

  return (posts || []).map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: any) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single()

    if (error) {
      console.error('Error fetching post:', error)
      notFound()
    }

    if (!post) {
      notFound()
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Blog&apos;a dön
          </Link>

          <article className="prose lg:prose-lg max-w-none">
            <h1 className="text-4xl font-serif mb-4">{post.title}</h1>
            
            <div className="text-gray-500 mb-8">
              <time dateTime={post.published_at || post.created_at}>
                {new Date(post.published_at || post.created_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>

            {post.featured_image && (
              <div className="relative w-full h-96 mb-8">
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
            )}

            <div className="whitespace-pre-wrap">{post.content}</div>
          </article>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in BlogPostPage:', error)
    notFound()
  }
} 