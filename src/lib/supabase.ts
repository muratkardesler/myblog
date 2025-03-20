import {
  createClientComponentClient,
  createServerComponentClient
} from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type Database } from './database.types';
import { formatDate } from './utils';
import { createClient } from '@supabase/supabase-js';
import { Post, Category, PostLike, User } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Tarayıcı ortamını kontrol et
const isBrowser = typeof window !== 'undefined';

// Supabase istemcisini tek bir instance olarak oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // URL'de oturum bilgisi arama, bunun yerine localStorage kullan
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: {
      'x-client-info': `my-blog-app/${isBrowser ? navigator.userAgent : 'server'}`,
    },
    fetch: (...args) => {
      // Rate limit sorunlarını önlemek için özel fetch ayarları
      const fetchWithTimeout = async (resource: RequestInfo | URL, options?: RequestInit) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout
        
        try {
          const response = await fetch(resource, {
            ...options,
            signal: controller.signal,
          });
          clearTimeout(id);
          return response;
        } catch (error) {
          clearTimeout(id);
          throw error;
        }
      };
      
      return fetchWithTimeout(args[0] as RequestInfo, args[1]);
    }
  }
});

// Yardımcı fonksiyon - Aritmetik gecikme ile yeniden deneme
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth fonksiyonları
export async function registerUser(email: string, password: string, full_name: string) {
  try {
    // Önce e-posta adresinin zaten kullanımda olup olmadığını kontrol et
    const { data: userExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (userExists) {
      return { 
        success: false, 
        error: { 
          message: 'Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapmayı deneyin veya doğrulama e-postanızı kontrol edin.' 
        } 
      };
    }
    
    // Site URL'sini al
    let siteUrl = "";
    if (typeof window !== 'undefined') {
      // Tarayıcı ortamında doğru host ve protokolü kullan
      const host = window.location.host; // 'localhost:3000' veya 'muratkardesler.com'
      const protocol = window.location.protocol; // 'http:' veya 'https:'
      siteUrl = `${protocol}//${host}`;
    }
    
    // Kullanıcı kaydı
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/login`,
        data: {
          full_name
        }
      }
    });

    if (authError) {
      console.error('Auth kaydı hatası:', authError);
      
      // Duplicate e-posta kontrolü
      if (authError.message?.includes('email') || 
          authError.message?.includes('already') || 
          authError.message?.includes('registered')) {
        return { 
          success: false, 
          error: { 
            message: 'Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapmayı deneyin veya doğrulama e-postanızı kontrol edin.' 
          } 
        };
      }
      
      throw authError;
    }

    console.log('Auth data:', authData);

    if (authData?.user) {
      // Profile bilgilerinin kaydı
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Profile oluşturma hatası:', profileError);
        
        // Duplicate e-posta kontrolü
        if (profileError.code === '23505') {
          return { 
            success: false, 
            error: { 
              message: 'Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapmayı deneyin veya doğrulama e-postanızı kontrol edin.',
              code: '23505'
            } 
          };
        }
        
        throw profileError;
      }
    }

    return { 
      success: true, 
      user: authData?.user || null, 
      message: 'Kayıt başarılı! Lütfen e-posta adresinizi kontrol edin ve hesabınızı doğrulayın.' 
    };
  } catch (error) {
    console.error('Kullanıcı kaydı hatası:', error);
    return { success: false, error };
  }
}

export const loginUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error };
    }

    if (data?.user) {
      // Kullanıcının aktif olup olmadığını kontrol et
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_active')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('Kullanıcı durumu kontrol edilirken hata:', userError);
        return { success: false, error: userError };
      }

      // Kullanıcı pasif ise oturumu sonlandır ve hata mesajı döndür
      if (userData && userData.is_active === false) {
        // Oturumu sonlandır
        await supabase.auth.signOut();
        
        return { 
          success: false, 
          error: { 
            message: 'Hesabınız yönetici tarafından engellenmiştir. İletişim için site yöneticisiyle görüşün.', 
            code: 'ACCOUNT_DISABLED' 
          } 
        };
      }

      // Son giriş zamanını güncelle (sadece aktif kullanıcılar için)
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      if (updateError) {
        console.error('Son giriş zamanı güncellenirken hata:', updateError);
        // Bu hata kritik değil, kullanıcıyı yine de giriş yaptıralım
      }

      return { success: true, data };
    }

    return { success: false, error: { message: 'Bilinmeyen bir hata oluştu.' } };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error instanceof Error ? error : new Error('Bilinmeyen bir hata oluştu.') };
  }
};

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Çıkış hatası:', error);
    return { success: false, error };
  }
}

export async function resetPassword(email: string) {
  try {
    // Site URL'sini al
    let siteUrl = "";
    if (typeof window !== 'undefined') {
      // Tarayıcı ortamında doğru host ve protokolü kullan
      const host = window.location.host; 
      const protocol = window.location.protocol; 
      siteUrl = `${protocol}//${host}`;
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/reset-password`,
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    return { success: false, error };
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Şifre güncelleme hatası:', error);
    return { success: false, error };
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    console.log('getUsers fonksiyonu çağrıldı');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Kullanıcıları getirme hatası:', error);
      throw error;
    }

    console.log('Bulunan kullanıcı sayısı:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    return [];
  }
}

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

export async function likePost(postId: string, ipAddress: string) {
  try {
    // Daha önce beğeni yapılmış mı kontrol et
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('ip_address', ipAddress)
      .maybeSingle();

    if (checkError) {
      console.error('Beğeni kontrolü hatası:', checkError);
      return { success: false, error: checkError };
    }

    // Eğer daha önce beğeni yapılmışsa, beğeniyi kaldır
    if (existingLike) {
      const { error: deleteLikeError } = await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteLikeError) {
        console.error('Beğeni kaldırma hatası:', deleteLikeError);
        return { success: false, error: deleteLikeError };
      }

      return { success: true, action: 'unliked' };
    }

    // Yeni beğeni ekle
    const { data: newLike, error: insertError } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        ip_address: ipAddress
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Beğeni ekleme hatası:', insertError);
      return { success: false, error: insertError };
    }

    return { success: true, action: 'liked', data: newLike };
  } catch (error) {
    console.error('Beğeni işlemi hatası:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Beğeni işlemi sırasında bir hata oluştu.') 
    };
  }
}

// Mevcut oturumu ve kullanıcı bilgilerini döndüren fonksiyon
export async function getCurrentUser() {
  try {
    // Oturumu kontrol et
    const { data: { session } } = await supabase.auth.getSession();
    
    // Oturum yoksa null döndür
    if (!session) {
      console.log("Oturum bulunamadı");
      return { success: false, user: null, profile: null };
    }

    // Oturum varsa kullanıcı profilini getir
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error("Profil bilgisi alınamadı:", error);
      return { success: true, user: session.user, profile: null };
    }

    return { success: true, user: session.user, profile };
  } catch (error) {
    console.error("Oturum kontrolü hatası:", error);
    return { success: false, user: null, profile: null };
  }
} 