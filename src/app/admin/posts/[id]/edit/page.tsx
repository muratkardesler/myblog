import EditPostForm from './EditPostForm'
import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: post } = await supabase
    .from('posts')
    .select('title')
    .eq('id', params.id)
    .single()

  return {
    title: post ? `${post.title} - Düzenle` : 'Blog Yazısı Düzenle',
  }
}

export default function EditPostPage({ params }: PageProps) {
  return <EditPostForm postId={params.id} />
} 