import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';
import { Category, PostWithCategory } from './types';

// Filtrelerde kullanılacak tiplemeler
export interface PostFilters {
  category?: string;
  featured?: boolean;
  popular?: boolean;
}

// Client component tarafında kullanım için
export function createClient() {
  return createClientComponentClient<Database>();
}

// Supabase client instance oluştur
export const supabase = createClient();

// Mevcut kullanıcıyı getir
export async function getCurrentUser(): Promise<{ success: boolean; user: Database['public']['Tables']['users']['Row'] | null }> {
  const supabase = createClientComponentClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    if (!user) {
      return { success: false, user: null };
    }
    
    // Veritabanından kullanıcı bilgilerini getir
    const { data, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      // Eğer profil bulunamazsa, auth verilerini kullan
      return { 
        success: true, 
        user: {
          id: user.id,
          email: user.email || '',
          created_at: user.created_at || '',
          full_name: '',
          updated_at: '',
          last_login: '',
          is_active: true
        }
      };
    }
    
    // Veritabanından gelen kullanıcı bilgilerini döndür
    return { success: true, user: data };
    
  } catch (error) {
    console.error('Kullanıcı bilgileri alınırken hata:', error);
    return { success: false, user: null };
  }
}

// Giriş yapma işlemi
export async function loginUser(email: string, password: string) {
  try {
    // Supabase istemcisini oluştur
    const supabase = createClient();
    
    // Giriş yap
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Giriş hatası:", error);
      return { success: false, error, data: null };
    }
    
    if (!data || !data.session) {
      return { success: false, error: new Error('Oturum oluşturulamadı.'), data: null };
    }
    
    // Kullanıcı giriş zamanını veritabanında güncelle
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', data.user.id);
      
      if (updateError) {
        console.error("Kullanıcı son giriş tarihi güncellenemedi:", updateError);
      }
    } catch (updateError) {
      console.error("Son giriş tarihi güncellenirken hata:", updateError);
    }
    
    // Başarılı giriş bilgilerini döndür
    return { success: true, error: null, data };
  } catch (error) {
    console.error("Login işleminde beklenmeyen hata:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Bilinmeyen bir hata oluştu.'),
      data: null 
    };
  }
}

// Çıkış yapma işlemi
export async function logoutUser() {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Çıkış işleminde beklenmeyen hata:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Bilinmeyen bir hata oluştu.')
    };
  }
}

// Blog makalelerini getir
export async function getBlogPosts(limit = 10, offset = 0, filters: PostFilters = {}) {
  try {
    const supabase = createClient();
    let query = supabase
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
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    
    // Filtreleri uygula
    if (filters) {
      // Kategori filtresi
      if (filters.category) {
        query = query.eq('categories.slug', filters.category);
      }
      
      // Öne çıkan filtreleme
      if (filters.featured === true) {
        query = query.eq('is_featured', true);
      }
      
      // Popüler filtreleme
      if (filters.popular === true) {
        query = query.eq('is_popular', true);
      }
    }
    
    // Pagination
    const { data, error, count } = await query
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

// En son gönderileri getir
export async function getLatestPosts(limit = 6): Promise<PostWithCategory[]> {
  try {
    const { data } = await supabase
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
        category_id,
        category:category_id (id, name, slug, color)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    // Veriyi PostWithCategory tipine dönüştür
    const formattedPosts = data?.map(post => ({
      ...post,
      category: Array.isArray(post.category) && post.category.length > 0 
        ? post.category[0] 
        : { id: '', name: '', slug: '', color: '', created_at: '', updated_at: '' }
    })) as PostWithCategory[] || [];

    return formattedPosts;
  } catch (error) {
    console.error('En son gönderiler alınırken hata:', error);
    return [];
  }
}

// Popüler gönderileri getir
export async function getPopularPosts(limit = 5): Promise<PostWithCategory[]> {
  try {
    const { data } = await supabase
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
        category_id,
        category:category_id (id, name, slug, color)
      `)
      .eq('status', 'published')
      .eq('is_popular', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    // Veriyi PostWithCategory tipine dönüştür
    const formattedPosts = data?.map(post => ({
      ...post,
      category: Array.isArray(post.category) && post.category.length > 0 
        ? post.category[0] 
        : { id: '', name: '', slug: '', color: '', created_at: '', updated_at: '' }
    })) as PostWithCategory[] || [];

    return formattedPosts;
  } catch (error) {
    console.error('Popüler gönderiler alınırken hata:', error);
    return [];
  }
}

// Öne çıkan gönderiyi getir
export async function getFeaturedPost(): Promise<PostWithCategory | null> {
  try {
    const { data } = await supabase
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
        category_id,
        category:category_id (id, name, slug, color)
      `)
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .single();
      
    if (!data) return null;
    
    // Veriyi PostWithCategory tipine dönüştür
    const formattedPost = {
      ...data,
      category: Array.isArray(data.category) && data.category.length > 0 
        ? data.category[0] 
        : { id: '', name: '', slug: '', color: '', created_at: '', updated_at: '' }
    } as PostWithCategory;
    
    return formattedPost;
  } catch (error) {
    console.error('Öne çıkan gönderi alınırken hata:', error);
    return null;
  }
}

// Gönderi beğeni sayısını getir
export async function getPostLikes(postId: string): Promise<number> {
  try {
    const { count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    return count || 0;
  } catch (error) {
    console.error('Gönderi beğeni sayısı alınırken hata:', error);
    return 0;
  }
}

// Gönderiyi beğen
export async function likePost(postId: string, ipAddress: string) {
  try {
    // Önce kullanıcının bu gönderiyi beğenip beğenmediğini kontrol et
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('ip_address', ipAddress)
      .maybeSingle();

    if (existingLike) {
      // Kullanıcı daha önce beğenmişse, beğeniyi kaldır
      await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);

      return { success: true, action: 'unliked' };
    } else {
      // Kullanıcı daha önce beğenmemişse, yeni beğeni ekle
      await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        });

      return { success: true, action: 'liked' };
    }
  } catch (error) {
    console.error('Gönderi beğeni işlemi sırasında hata:', error);
    return { success: false, error };
  }
}

// Kategorileri gönderi sayısıyla birlikte getir
export async function getCategoriesWithPostCount() {
  try {
    const { data } = await supabase
      .from('categories_with_post_count')
      .select('*')
      .order('name');

    return data || [];
  } catch (error) {
    console.error('Kategoriler alınırken hata:', error);
    return [];
  }
}

// Blog kategorilerini getir
export async function getBlogCategories() {
  try {
    const supabase = createClient();
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

// Kategori oluştur
export async function createCategory(category: Category) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .insert([
        { 
          name: category.name,
          slug: category.slug,
          color: category.color || '#6b7280',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Kategori oluşturulurken hata:', error);
      return { success: false, data: null, error };
    }
    
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Kategori oluşturulurken bir hata oluştu:', error);
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error : new Error('Bilinmeyen bir hata oluştu.') 
    };
  }
}

// Kullanıcı kaydı
export async function registerUser(email: string, password: string, full_name: string) {
  try {
    const supabase = createClient();
    
    // ÖNEMLİ: Canlı site URL'sini doğrudan kullan, localhost kullanma
    const siteUrl = 'https://muratblog.com';
      
    // Önce e-posta adresinin zaten kullanımda olup olmadığını kontrol et
    const { data: userExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (userExists) {
      return { 
        success: false, 
        error: { message: 'Bu e-posta adresi zaten kullanımda. Lütfen farklı bir e-posta adresi deneyin.' }
      };
    }
    
    // Yeni kullanıcı oluştur - type parametresi ile doğrulama e-postası olarak gönder
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name
        },
        emailRedirectTo: `${siteUrl}/auth/confirm`,
      }
    });
    
    if (authError) {
      console.error('Kayıt hatası:', authError);
      return { success: false, error: authError };
    }
    
    if (!authData.user) {
      return { success: false, error: { message: 'Kullanıcı oluşturulamadı.' } };
    }
    
    // Kullanıcı bilgilerini veritabanına kaydet
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: email,
          full_name: full_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        }
      ]);
    
    if (profileError) {
      console.error('Profil oluşturma hatası:', profileError);
      // Auth kullanıcısı oluşturuldu ama profil tablosuna kayıt başarısız oldu
      console.warn('Kullanıcı oluşturuldu ama profil kaydı başarısız oldu. Manuel müdahale gerekli olabilir.');
      
      return { success: false, error: profileError };
    }
    
    return { success: true, data: authData };
  } catch (error) {
    console.error('Kayıt işleminde beklenmeyen hata:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Bilinmeyen bir hata oluştu.') 
    };
  }
}

export const refreshAuthSession = async () => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.auth.refreshSession();
    return { success: !error, data, error };
  } catch (error) {
    console.error('Auth refresh error:', error);
    return { success: false, error };
  }
};

// Şifre sıfırlama e-postası gönder
export async function resetPassword(email: string): Promise<{ success: boolean; message: string }> {
  const supabase = createClientComponentClient();
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password?update=true`,
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.'
    };
  } catch (error: any) {
    console.error('Şifre sıfırlama hatası:', error);
    return {
      success: false,
      message: error.message || 'Şifre sıfırlama işlemi başarısız oldu.'
    };
  }
}

// Şifre güncelleme
export async function updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
  const supabase = createClientComponentClient();
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Şifreniz başarıyla güncellendi.'
    };
  } catch (error: any) {
    console.error('Şifre güncelleme hatası:', error);
    return {
      success: false,
      message: error.message || 'Şifre güncelleme işlemi başarısız oldu.'
    };
  }
}

// Kategori bazlı yazıları getir
export async function getPostsByCategory(slug: string, page = 1, limit = 6): Promise<{ posts: PostWithCategory[]; total: number }> {
  const supabase = createClientComponentClient();
  try {
    // Önce kategoriyi bul
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!categoryData) {
      return { posts: [], total: 0 };
    }

    // Toplam yazı sayısını al
    const { count } = await supabase
      .from('posts')
      .select('id', { count: 'exact' })
      .eq('category_id', categoryData.id)
      .eq('status', 'published');

    // Yazıları getir
    const { data } = await supabase
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
        category_id,
        category:category_id (id, name, slug, color)
      `)
      .eq('category_id', categoryData.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Veriyi PostWithCategory tipine dönüştür
    const formattedPosts = data?.map(post => ({
      ...post,
      category: Array.isArray(post.category) && post.category.length > 0 
        ? post.category[0] 
        : { id: '', name: '', slug: '', color: '', created_at: '', updated_at: '' }
    })) as PostWithCategory[] || [];

    return { 
      posts: formattedPosts, 
      total: count || 0 
    };
  } catch (error) {
    console.error('Kategori yazıları alınırken hata:', error);
    return { posts: [], total: 0 };
  }
} 