import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import EditPostClient from './EditPostClient'

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
  return <EditPostClient params={params} />
} 