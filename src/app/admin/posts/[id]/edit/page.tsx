import { Metadata } from 'next'
import EditPostForm from './EditPostForm'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Blog Yazısı Düzenle',
}

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: post } = await supabase
    .from('posts')
    .select('title')
    .eq('id', params.id)
    .single()

  return (
    <>
      <title>{post?.title ? `${post.title} - Düzenle` : 'Blog Yazısı Düzenle'}</title>
      <EditPostForm postId={params.id} />
    </>
  )
} 