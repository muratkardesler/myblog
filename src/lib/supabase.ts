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
      const fetchWithTimeout = async (resource: RequestInfo, options?: RequestInit) => {
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
      
      return fetchWithTimeout(args[0], args[1]);
    }
  }
});

// Yardımcı fonksiyon - Aritmetik gecikme ile yeniden deneme
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth fonksiyonları
export async function registerUser(email: string, password: string, full_name: string) {
  try {
    // Önce e-posta adresinin zaten kullanımda olup olmadığını kontrol et
    const { data: userExists, error: userExistsError } = await supabase
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
    
    // Kullanıcı kaydı
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/login`,
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

export async function loginUser(email: string, password: string) {
  const maxRetries = 3;
  let retryCount = 0;
  let backoffTime = 1000; // 1 saniye
  
  // Retry işlemi ile giriş yap
  while(retryCount < maxRetries) {
    try {
      // Her denemede önceki oturumları temizle
      if (retryCount > 0) {
        await supabase.auth.signOut();
        console.log(`Giriş yeniden deneniyor (${retryCount}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Rate limit hatası
        if (error.status === 429) {
          retryCount++;
          backoffTime *= 2; // Her denemede bekleme süresini ikiye katla
          console.warn(`Rate limit hatası, ${backoffTime/1000} saniye bekleyip tekrar deneniyor...`);
          continue; // Döngüyü devam ettir
        }
        
        // Kimlik bilgileri hatası
        if (error.message?.includes('Invalid login credentials')) {
          return { 
            success: false, 
            error: { 
              message: 'E-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.' 
            } 
          };
        }
        
        // Diğer hatalar
        return { 
          success: false, 
          error: { 
            message: `Giriş hatası: ${error.message}` 
          } 
        };
      }

      // Başarılı giriş - son giriş zamanını güncelle
      if (data?.user) {
        await supabase
          .from('users')
          .update({
            last_login: new Date().toISOString(),
          })
          .eq('id', data.user.id)
          .then(result => {
            if (result.error) {
              console.warn('Son giriş zamanı güncellenemedi:', result.error);
            }
          });
      }

      return { success: true, user: data?.user || null };
    } catch (error: any) {
      retryCount++;
      
      if (retryCount >= maxRetries) {
        console.error('Maksimum deneme sayısına ulaşıldı:', error);
        return { 
          success: false, 
          error: { 
            message: 'Giriş yapılamadı. Lütfen daha sonra tekrar deneyin.' 
          } 
        };
      }
      
      // Hata türüne göre bekleme süresi ayarla
      backoffTime *= 2;
      console.warn(`Hata oluştu, ${backoffTime/1000} saniye bekleyip tekrar deneniyor...`, error);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  
  // Bu noktaya asla ulaşılmamalı, ama TypeScript için gerekli
  return { 
    success: false, 
    error: { 
      message: 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.' 
    } 
  };
}

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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Kullanıcıları getirme hatası:', error);
      return [];
    }

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

export async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Oturum kontrol hatası:', error);
      return { success: false, user: null, error };
    }
    
    if (!session) {
      return { success: false, user: null };
    }
    
    // Kullanıcı profil bilgilerini al
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('Profil bilgisi alma hatası:', profileError);
      return { success: true, user: session.user, profile: null };
    }
    
    return { 
      success: true, 
      user: session.user,
      profile
    };
  } catch (error) {
    console.error('Kullanıcı bilgisi alma hatası:', error);
    return { success: false, user: null, error };
  }
} 