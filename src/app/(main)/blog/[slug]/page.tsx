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
    color: #374151;
  }
  
  .blog-content h1, .blog-content h2, .blog-content h3 {
    font-weight: 700;
    margin-top: 1.5em;
    margin-bottom: 0.75em;
    color: #111827;
  }
  
  .blog-content h1 {
    font-size: 2rem;
  }
  
  .blog-content h2 {
    font-size: 1.75rem;
  }
  
  .blog-content h3 {
    font-size: 1.5rem;
  }
  
  .blog-content p {
    margin-bottom: 1.25em;
  }
  
  .blog-content img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 1.5rem auto;
    display: block;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
    transition: color 0.2s;
  }
  
  .blog-content a:hover {
    color: #4338ca;
  }
  
  .blog-content blockquote {
    border-left: 4px solid #e5e7eb;
    padding: 0.5rem 0 0.5rem 1rem;
    font-style: italic;
    margin: 1.5rem 0;
    background-color: #f9fafb;
    border-radius: 0 0.25rem 0.25rem 0;
  }
  
  .blog-content pre {
    background-color: #1f2937;
    color: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1.5rem 0;
  }
  
  .blog-content code {
    font-family: 'Courier New', Courier, monospace;
    background-color: #f3f4f6;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }
  
  .blog-content pre code {
    background-color: transparent;
    padding: 0;
  }
  
  .blog-content .aspect-w-16 {
    position: relative;
    padding-bottom: 56.25%;
  }
  
  .blog-content .aspect-w-16 iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 0.5rem;
  }
`

// HTML içeriğini temizleyen yardımcı fonksiyon
function cleanHtml(html: string): string {
  return html
    // HTML etiketlerini düzelt
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    // Resim etiketlerini düzelt - img etiketlerini responsive ve tam görünür yap
    .replace(/<img(.*?)src="(.*?)"(.*?)>/g, '<img$1src="$2"$3 class="w-full h-auto my-6 rounded-lg" style="max-width: 100%; display: block; margin: 1.5rem auto;">')
    // Bağlantıları düzelt
    .replace(/<a href="(.*?)">/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">')
    // Paragrafları düzelt
    .replace(/<p>\s*<\/p>/g, '')
    // Başlıkları düzelt
    .replace(/<h1>(.*?)<\/h1>/g, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/<h2>(.*?)<\/h2>/g, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/<h3>(.*?)<\/h3>/g, '<h3 class="text-xl font-bold mt-5 mb-2">$1</h3>')
    // Listeleri düzelt
    .replace(/<ul>/g, '<ul class="list-disc pl-6 my-4">')
    .replace(/<ol>/g, '<ol class="list-decimal pl-6 my-4">')
    // YouTube iframe'lerini düzelt
    .replace(/<iframe(.*?)src="(.*?)"(.*?)><\/iframe>/g, '<div class="aspect-w-16 aspect-h-9 my-6"><iframe$1src="$2"$3 class="w-full h-full rounded-lg"></iframe></div>');
}

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

    // İçeriği temizle
    const cleanedContent = cleanHtml(post.content);

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
              dangerouslySetInnerHTML={{ __html: cleanedContent }}
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