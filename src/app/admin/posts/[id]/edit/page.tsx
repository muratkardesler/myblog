import EditPostForm from './EditPostForm'
import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: post } = await supabase
    .from('posts')
    .select('title')
    .eq('id', props.params.id)
    .single()

  return {
    title: post ? `${post.title} - Düzenle` : 'Blog Yazısı Düzenle',
  }
}

export default function Page(props: PageProps) {
  return <EditPostForm postId={props.params.id} />
} 