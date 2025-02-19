import EditPostClient from './EditPostClient'
import { PageProps } from '../../../../types'

export const metadata = {
  title: 'Blog Yazısı Düzenle'
}

export default function Page({ params }: PageProps) {
  return <EditPostClient params={params} />
} 