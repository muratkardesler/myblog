import EditPostClient from './EditPostClient'
import { PageProps } from '@/app/types'

export const metadata = {
  title: 'Blog Yazısı Düzenle'
}

export default async function Page({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  return <EditPostClient params={resolvedParams} searchParams={resolvedSearchParams} />
} 