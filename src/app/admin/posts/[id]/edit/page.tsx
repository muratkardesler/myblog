import EditPostForm from './EditPostForm'

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditPostPage({ params }: PageProps) {
  return <EditPostForm postId={params.id} />
} 