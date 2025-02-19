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

export interface PageProps {
  params: Promise<{
    id?: string
    slug?: string
  }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
} 