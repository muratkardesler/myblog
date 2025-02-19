import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { FaCalendar } from 'react-icons/fa'
import Image from 'next/image'

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

export const revalidate = 60 // Her 60 saniyede bir yeniden oluştur

export default async function BlogPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({
    cookies: () => cookieStore
  })

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const typedPosts: Post[] = posts || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-serif mb-12 text-center">Blog Yazılarım</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {typedPosts.map((post, index) => (
          <article 
            key={post.id} 
            className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100 ${
              index === 0 ? 'col-span-full lg:col-span-2' : ''
            }`}
          >
            {post.featured_image && (
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                <FaCalendar className="text-blue-600" />
                <time dateTime={post.published_at || post.created_at}>
                  {new Date(post.published_at || post.created_at).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              
              <h2 className="text-2xl font-semibold mb-3">
                <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                  {post.title}
                </Link>
              </h2>
              
              <div 
                className="text-gray-600 mb-4 line-clamp-3 prose"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              <Link 
                href={`/blog/${post.slug}`} 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <span>Devamını oku</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </article>
        ))}

        {!typedPosts.length && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
              />
            </svg>
            <p className="text-gray-600 text-lg">
              Henüz blog yazısı bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 