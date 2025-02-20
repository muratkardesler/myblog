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
  created_at: string;
  updated_at: string;
  published_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface PostWithCategory extends Post {
  category: Category;
} 