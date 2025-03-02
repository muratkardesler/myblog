import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PageProps } from '@/app/types'
import HtmlContentServer from '@/components/HtmlContentServer'

// Dinamik metadata oluşturmak için generateMetadata fonksiyonu
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params
    const cookieStore = cookies()
    const supabase = createServerComponentClient({
      cookies: () => cookieStore
    })

    const { data: post, error } = await supabase
      .from('posts')
      .select('*, categories:category_id(name)')
      .eq('slug', resolvedParams.slug)
      .eq('status', 'published')
      .single()

    if (error || !post) {
      return {
        title: 'Blog Yazısı',
        description: 'Blog yazısı bulunamadı',
      }
    }

    // Kategori tipini tanımlayalım
    interface Category {
      name: string;
    }

    // Excerpt veya içeriğin ilk 160 karakterini al
    const description = post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
    const category = post.categories ? (post.categories as Category).name : 'Blog'

    return {
      title: post.title,
      description: description,
      openGraph: {
        title: post.title,
        description: description,
        url: `https://muratkardesler.com/blog/${post.slug}`,
        siteName: 'Murat Kardeşler Blog',
        images: [
          {
            url: post.featured_image || 'https://muratkardesler.com/images/og-image.jpg',
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        locale: 'tr_TR',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: description,
        images: [post.featured_image || 'https://muratkardesler.com/images/og-image.jpg'],
      },
      alternates: {
        canonical: `https://muratkardesler.com/blog/${post.slug}`,
      },
      keywords: [category, 'blog', 'Murat Kardeşler', 'yazılım', 'teknoloji'],
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Blog Yazısı',
      description: 'Murat Kardeşler Blog',
    }
  }
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
  if (!html) return '';
  
  // HTML etiketlerini düzgün şekilde parse et
  let parsedContent = html;
  
  // Eğer içerik HTML etiketleri içeriyorsa ancak düz metin olarak görünüyorsa
  if (
    html.includes('&lt;') || 
    html.includes('&gt;') || 
    html.includes('&quot;') || 
    html.includes('&#39;') || 
    html.includes('&amp;')
  ) {
    parsedContent = html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }
  
  return parsedContent;
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

            <HtmlContentServer content={cleanedContent} className="prose lg:prose-lg max-w-none blog-content" />
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