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

export interface PageParams {
  params: {
    id?: string
    slug?: string
  }
  searchParams?: { [key: string]: string | string[] | undefined }
} 