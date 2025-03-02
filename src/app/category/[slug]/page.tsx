import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import CategoryPageClient from '@/components/CategoryPageClient';
import { PageProps } from '@/app/types';

// Kategori sayfası için metadata oluşturma fonksiyonu
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const cookieStore = cookies()
    const supabase = createServerComponentClient({
      cookies: () => cookieStore
    })

    // Kategori bilgilerini al
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', resolvedParams.slug)
      .single()

    if (error || !category) {
      return {
        title: 'Kategori',
        description: 'Kategori bulunamadı',
      }
    }

    return {
      title: `${category.name} Yazıları - Murat Kardeşler Blog`,
      description: `${category.name} kategorisindeki tüm yazılar. Murat Kardeşler Blog.`,
      openGraph: {
        title: `${category.name} Yazıları - Murat Kardeşler Blog`,
        description: `${category.name} kategorisindeki tüm yazılar. Murat Kardeşler Blog.`,
        url: `https://muratkardesler.com/category/${category.slug}`,
        siteName: 'Murat Kardeşler Blog',
        images: [
          {
            url: 'https://muratkardesler.com/images/og-image.jpg',
            width: 1200,
            height: 630,
            alt: `${category.name} Kategorisi`,
          },
        ],
        locale: 'tr_TR',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${category.name} Yazıları - Murat Kardeşler Blog`,
        description: `${category.name} kategorisindeki tüm yazılar. Murat Kardeşler Blog.`,
        images: ['https://muratkardesler.com/images/og-image.jpg'],
      },
      alternates: {
        canonical: `https://muratkardesler.com/category/${category.slug}`,
      },
      keywords: [category.name, 'blog', 'Murat Kardeşler', 'yazılım', 'teknoloji'],
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Kategori',
      description: 'Murat Kardeşler Blog',
    }
  }
}

export default async function CategoryPage({ params }: PageProps) {
  try {
    const resolvedParams = await params;
    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore
    });

    // Kategori bilgilerini al
    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', resolvedParams.slug)
      .single();

    // Kategori yazılarını al
    const { data: posts } = await supabase
      .from('posts')
      .select('*, category:category_id(id, name, slug, color)')
      .eq('category_id', category?.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    return (
      <CategoryPageClient 
        initialCategory={category || null} 
        initialPosts={posts || []} 
        slug={resolvedParams.slug || ''}
      />
    );
  } catch (error) {
    console.error('Error in CategoryPage:', error);
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-red-500">Bir hata oluştu</h1>
        <p className="mt-4 text-gray-400">Kategori yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.</p>
      </div>
    );
  }
} 