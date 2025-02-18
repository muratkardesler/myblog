import { Metadata } from 'next'
import EditPostForm from './EditPostForm'

export const metadata: Metadata = {
  title: 'Blog Yazısı Düzenle',
}

type PageParams = {
  params: {
    id: string
  }
}

async function Page(props: PageParams) {
  return <EditPostForm postId={props.params.id} />
}

export default Page 