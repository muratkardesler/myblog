import EditPostClient from './EditPostClient'

interface Props {
  params: {
    id: string
  }
}

export const metadata = {
  title: 'Blog Yazısı Düzenle'
}

export default function Page({ params }: Props) {
  return <EditPostClient params={params} />
} 