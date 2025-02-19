import EditPostClient from './EditPostClient'

export const metadata = {
  title: 'Blog Yazısı Düzenle'
}

interface Props {
  params: {
    id: string
  }
}

export default function Page({ params }: Props) {
  return <EditPostClient params={params} />
} 