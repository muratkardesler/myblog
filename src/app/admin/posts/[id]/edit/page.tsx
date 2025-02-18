import { Metadata } from 'next'
import EditPostForm from './EditPostForm'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

type PageParams = {
  id: string
}

type Props = {
  params: PageParams
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params
  const supabase = createServerComponentClient({ cookies })
  
  const { data: post } = await supabase
    .from('posts')
    .select('title')
    .eq('id', id)
    .single()

  return {
    title: post?.title ? `${post.title} - Düzenle` : 'Blog Yazısı Düzenle',
  }
}

export default async function Page({ params }: Props) {
  const { id } = params
  return <EditPostForm postId={id} />
} 