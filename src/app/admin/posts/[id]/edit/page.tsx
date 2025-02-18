import { Metadata } from 'next'
import { PageProps } from '@/app/types'
import EditPostForm from './EditPostForm'

export const metadata: Metadata = {
  title: 'Blog Yazısı Düzenle',
}

type EditPageParams = {
  id: string
}

export default async function Page({ params }: PageProps<EditPageParams>) {
  return (
    <>
      <EditPostForm postId={params.id} />
    </>
  )
} 