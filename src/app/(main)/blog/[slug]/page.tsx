import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PageProps } from '@/app/types'

export const metadata: Metadata = {
  title: 'Blog Yazısı',
  viewport: 'width=device-width, initial-scale=1',
}

// CSS sınıflarını tanımlayalım
const styles = `
  .blog-content {
    font-family: 'Inter', sans-serif;
    line-height: 1.8;
  }
  
  .blog-content h1, .blog-content h2, .blog-content h3 {
    font-weight: 700;
    margin-top: 1.5em;
    margin-bottom: 0.75em;
  }
  
  .blog-content p {
    margin-bottom: 1.25em;
  }
  
  .blog-content img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 1.5rem 0;
    display: block;
  }
  
  .blog-content ul, .blog-content ol {
    padding-left: 1.5rem;
    margin-bottom: 1.25em;
  }
  
  .blog-content li {
    margin-bottom: 0.5em;
  }
  
  .blog-content a {
    color: #4f46e5;
    text-decoration: underline;
  }
  
  .blog-content blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1rem;
    font-style: italic;
    margin: 1.5rem 0;
  }
`

async function Page({ params }: PageProps) {
  try {
    const resolvedParams = await params
    const cookieStore = cookies()
    const supabase = createServerComponentClient({
      cookies: () => cookieStore
    })

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', resolvedParams.slug)
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
        <style dangerouslySetInnerHTML={{ __html: styles }} />
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
              <div className="relative w-full h-96 md:h-[500px] mb-8">
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  fill
                  className="object-contain md:object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
            )}

            <div 
              className="prose lg:prose-lg max-w-none blog-content"
              dangerouslySetInnerHTML={{ 
                __html: post.content
                  // Resimleri düzgün görüntülemek için
                  .replace(/<img src="(.*?)"(.*?)>/g, '<img src="$1" class="blog-image" $2>')
                  // Emoji ve özel karakterleri düzgün görüntülemek için
                  .replace(/&lt;p&gt;(.*?)&lt;\/p&gt;/g, '<p>$1</p>')
                  // URL'leri düzgün görüntülemek için
                  .replace(/<a href="(.*?)">/g, '<a href="$1" target="_blank" rel="noopener noreferrer">')
                  // Emojileri düzgün görüntülemek için
                  .replace(/📝|✅|🔥|💡|🚀|⚠️|ℹ️|🔍|🔒|🔓|🔴|🟢|🔵|⭐|🌟|✨|💫|💥|💢|💦|💨|💭|💬|💪|👉|👈|👆|👇|👍|👎|👏|🙌|👋|✋|👌|👊|✊|👀|👁️|👄|👅|👂|👃|👣|👤|👥|👶|👦|👧|👨|👩|👱|👴|👵|👲|👳|👮|👷|💂|🕵️|👼|👸|👰|🤵|👰|🤰|👲|🙍|🙎|🙅|🙆|💁|🙋|🙇|🤦|🤷|💆|💇|🚶|🏃|💃|🕺|👯|🧖|🧗|🧘|🛀|🛌|🕴️|🗣️|👤|👥|🫂|👪|👨‍👩‍👧|👨‍👩‍👧‍👦|👨‍👩‍👦‍👦|👨‍👩‍👧‍👧|👨‍👨‍👦|👨‍👨‍👧|👨‍👨‍👧‍👦|👨‍👨‍👦‍👦|👨‍👨‍👧‍👧|👩‍👩‍👦|👩‍👩‍👧|👩‍👩‍👧‍👦|👩‍👩‍👦‍👦|👩‍👩‍👧‍👧|👨‍👦|👨‍👦‍👦|👨‍👧|👨‍👧‍👦|👨‍👧‍👧|👩‍👦|👩‍👦‍👦|👩‍👧|👩‍👧‍👦|👩‍👧‍👧/g, (match: string) => `<span class="emoji" role="img">${match}</span>`)
              }}
            />

          </article>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in BlogPostPage:', error)
    notFound()
  }
}

export default Page

export const dynamic = 'force-dynamic' 