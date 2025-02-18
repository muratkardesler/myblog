import EditPostForm from './EditPostForm'
import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
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

interface PageProps {
  params: { id: string }
}

export default async function EditPostPage(props: PageProps) {
  return <EditPostForm postId={props.params.id} />
} 