import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  slug: string
  content: string
  featured_image: string | null
  status: string
  created_at: string
  published_at: string | null
}

interface Props {
  params: {
    slug: string
  }
}

export const revalidate = 60

export default async function BlogPostPage({ params }: Props) {
  const supabase = createServerComponentClient({ cookies })

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

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
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-8"
            />
          )}

          <div className="whitespace-pre-wrap">{post.content}</div>
        </article>
      </div>
    </div>
  )
} 