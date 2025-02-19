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
  id?: string
  slug?: string
}

export interface SearchParams {
  [key: string]: string | string[] | undefined
}

export interface PageProps {
  params: Promise<PageParams>
  searchParams?: Promise<SearchParams>
} 