export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  category_id: string;
  category?: Category;
  status: 'draft' | 'published';
  is_featured: boolean;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
  published_at: string;
  likes_count?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
  updated_at: string;
  post_count?: number;
}

export interface PostWithCategory extends Post {
  category: Category;
}

export interface PostLike {
  id: string;
  post_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
} 