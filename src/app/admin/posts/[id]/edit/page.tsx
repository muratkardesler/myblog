'use client'

import EditPostForm from './EditPostForm'

export default function Page({ params }: { params: { id: string } }) {
  return <EditPostForm postId={params.id} />
} 