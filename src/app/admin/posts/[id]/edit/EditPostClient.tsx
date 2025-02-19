'use client'

import EditPostForm from './EditPostForm'
import { PageParams, SearchParams } from '@/app/types'

interface EditPostClientProps {
  params: PageParams
  searchParams?: SearchParams
}

export default function EditPostClient({ params, searchParams }: EditPostClientProps) {
  if (!params.id) {
    return null
  }
  return <EditPostForm postId={params.id} />
} 