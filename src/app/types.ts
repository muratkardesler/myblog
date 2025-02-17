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

export type PageParams = {
  params: { [key: string]: string | string[] }
  searchParams?: { [key: string]: string | string[] | undefined }
} 