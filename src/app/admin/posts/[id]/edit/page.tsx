'use client'

import { Metadata } from 'next'
import EditPostForm from './EditPostForm'

export const metadata: Metadata = {
  title: 'Blog Yazısı Düzenle',
}

export default function Page({ params }: { params: { id: string } }) {
  return <EditPostForm postId={params.id} />
} 