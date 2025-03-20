import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from './database.types';

// Server component tarafında kullanım için
export function createServerClient() {
  return createServerComponentClient<Database>({ cookies });
}

// Sunucu tarafında blog makalelerini getir
export async function getServerBlogPosts(limit = 10, offset = 0) {
  try {
    const supabase = createServerClient();
    const { data, error, count } = await supabase
      .from('posts')
      .select(`
        id, 
        title,
        slug,
        excerpt,
        content,
        featured_image,
        status,
        is_featured,
        is_popular,
        created_at,
        updated_at,
        published_at,
        categories:category_id (id, name, slug, color)
      `, { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)
      .limit(limit);
    
    if (error) {
      console.error('Blog makaleleri alınırken hata:', error);
      return { success: false, data: null, error };
    }
    
    return { success: true, data, error: null, count };
  } catch (error) {
    console.error('Blog makaleleri alınırken bir hata oluştu:', error);
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error : new Error('Bilinmeyen bir hata oluştu.') 
    };
  }
}

// Sunucu tarafında kategorileri getir
export async function getServerBlogCategories() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('categories_with_post_count')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Kategoriler alınırken hata:', error);
      return { success: false, data: null, error };
    }
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Kategoriler alınırken bir hata oluştu:', error);
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error : new Error('Bilinmeyen bir hata oluştu.') 
    };
  }
} 