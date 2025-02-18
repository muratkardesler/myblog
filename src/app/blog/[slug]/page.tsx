'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type Props = {
  params: {
    slug: string
  }
}

export default function Page({ params }: Props) {
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', params.slug)
          .eq('status', 'published')
          .single()

        if (error) {
          console.error('Error fetching post:', error)
          notFound()
        }

        if (!data) {
          notFound()
        }

        setPost(data)
      } catch (error) {
        console.error('Error in BlogPostPage:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.slug, supabase])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!post) {
    return notFound()
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

          <div 
            className="prose lg:prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

        </article>
      </div>
    </div>
  )
} 