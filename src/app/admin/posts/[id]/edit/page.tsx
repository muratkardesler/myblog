import { Metadata } from 'next'
import EditPostForm from './EditPostForm'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface PageParams {
  id: string
}

interface Props {
  params: PageParams
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: post } = await supabase
    .from('posts')
    .select('title')
    .eq('id', params.id)
    .single()

  return {
    title: post?.title ? `${post.title} - Düzenle` : 'Blog Yazısı Düzenle',
  }
}

export default function Page({ params }: Props) {
  return <EditPostForm postId={params.id} />
} 