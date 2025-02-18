export interface Post {
  id: string
  title: string
  slug: string
  content: string
  featured_image: string | null
  status: string
  created_at: string
  published_at: string | null
}

export interface PageProps<T = any> {
  params: T
  searchParams?: { [key: string]: string | string[] | undefined }
} 