'use client'

import EditPostForm from './EditPostForm'

interface EditPostClientProps {
  params: {
    id: string
  }
}

export default function EditPostClient({ params }: EditPostClientProps) {
  return <EditPostForm postId={params.id} />
} 