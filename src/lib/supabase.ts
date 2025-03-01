import { createClient } from '@supabase/supabase-js';
import { Post, Category, PostLike } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getFeaturedPost(): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching featured post:', error);
    return null;
  }

  // Eğer veri yoksa null döndür, varsa ilk öğeyi döndür
  return data && data.length > 0 ? data[0] : null;
}

export async function getLatestPosts(limit: number = 4): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest posts:', error);
    return [];
  }

  return data || [];
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export async function getCategoriesWithPostCount(): Promise<(Category & { post_count: number })[]> {
  try {
    // Önce tüm kategorileri al
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return [];
    }

    if (!categories || categories.length === 0) {
      return [];
    }

    // Her kategori için yazı sayısını al
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const { count, error: countError } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('status', 'published');

        if (countError) {
          console.error(`Error fetching post count for category ${category.id}:`, countError);
          return { ...category, post_count: 0 };
        }

        return { ...category, post_count: count || 0 };
      })
    );

    return categoriesWithCount;
  } catch (error) {
    console.error('Error fetching categories with post count:', error);
    return [];
  }
}

export async function getPostsByCategory(categorySlug: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('status', 'published')
    .eq('category.slug', categorySlug)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts by category:', error);
    return [];
  }

  return data || [];
}

export async function getPopularPosts(limit: number = 3): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('status', 'published')
      .eq('is_popular', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching popular posts:', error);
      return [];
    }

    // Resim URL'lerini kontrol et
    const validPosts = data?.filter(post => {
      if (!post.featured_image) return false;
      
      try {
        // URL geçerli mi kontrol et
        new URL(post.featured_image);
        return true;
      } catch {
        console.error(`Invalid image URL for post ${post.id}:`, post.featured_image);
        return false;
      }
    }) || [];

    return validPosts;
  } catch (error) {
    console.error('Unexpected error fetching popular posts:', error);
    return [];
  }
}

// Kategori işlemleri için yeni fonksiyonlar
export async function createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        slug: category.slug,
        color: category.color
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    return null;
  }

  return data;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    return false;
  }

  return true;
}

// Post işlemleri için yeni fonksiyonlar
export async function createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'category'>): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select(`
      *,
      category:categories(*)
    `)
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return null;
  }

  return data;
}

export async function updatePost(id: string, post: Partial<Post>): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .update(post)
    .eq('id', id)
    .select(`
      *,
      category:categories(*)
    `)
    .single();

  if (error) {
    console.error('Error updating post:', error);
    return null;
  }

  return data;
}

export async function deletePost(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting post:', error);
    return false;
  }

  return true;
}

export async function getPostLikes(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (error) {
    console.error('Error fetching post likes:', error);
    return 0;
  }

  return count || 0;
}

export async function checkIfUserLikedPost(postId: string, ipAddress: string, userAgent: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('post_likes')
    .select('*')
    .eq('post_id', postId)
    .eq('ip_address', ipAddress)
    .maybeSingle();

  if (error) {
    console.error('Error checking if user liked post:', error);
    return false;
  }

  return !!data;
}

export async function likePost(postId: string, ipAddress: string, userAgent: string): Promise<boolean> {
  // Önce kullanıcının daha önce beğenip beğenmediğini kontrol et
  const alreadyLiked = await checkIfUserLikedPost(postId, ipAddress, userAgent);
  
  if (alreadyLiked) {
    // Kullanıcı zaten beğenmiş, beğeniyi kaldır
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('ip_address', ipAddress);

    if (error) {
      console.error('Error removing like:', error);
      return false;
    }
    
    return false; // Beğeni kaldırıldı
  } else {
    // Yeni beğeni ekle
    const { error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (error) {
      console.error('Error adding like:', error);
      return false;
    }
    
    return true; // Beğeni eklendi
  }
} 