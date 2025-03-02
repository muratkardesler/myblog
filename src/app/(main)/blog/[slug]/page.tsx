import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { PageProps } from '@/app/types'
import BlogPostClient from '@/components/BlogPostClient'

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
      .select('*, categories:category_id(name, slug, color)')
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
      slug: string;
      color: string;
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

export default async function Page({ params }: PageProps) {
  try {
    const resolvedParams = await params
    const cookieStore = cookies()
    const supabase = createServerComponentClient({
      cookies: () => cookieStore
    })

    const { data: post, error } = await supabase
      .from('posts')
      .select('*, category:category_id(name, slug, color)')
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

    return <BlogPostClient post={post} />
  } catch (error) {
    console.error('Error in BlogPostPage:', error)
    notFound()
  }
}

export const dynamic = 'force-dynamic' 