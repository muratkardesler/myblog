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

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  is_active: boolean;
}

export interface AuthForm {
  email: string;
  password: string;
  full_name?: string;
}

export interface WorkLog {
  id: string;
  user_id: string;
  date: string;
  project_code: string;
  client_name: string;
  contact_person: string;
  description: string;
  duration: number | string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  end_time?: string | null;
  log_time?: boolean;
}

export interface UserSettings {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  filter_month: number;
  filter_year: number;
  created_at: string;
  updated_at: string;
} 