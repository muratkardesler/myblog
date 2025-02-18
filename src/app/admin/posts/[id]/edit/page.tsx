import type { Metadata } from 'next'
import EditPostForm from './EditPostForm'

type Props = {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export const metadata: Metadata = {
  title: 'Blog Yazısı Düzenle',
}

export default async function Page(props: Props) {
  return <EditPostForm postId={props.params.id} />
} 