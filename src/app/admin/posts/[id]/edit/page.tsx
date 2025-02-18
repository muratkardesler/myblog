import { Metadata } from 'next'
import EditPostForm from './EditPostForm'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface PageProps {
  params: {
    id: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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

export default async function Page(props: PageProps) {
  return <EditPostForm postId={props.params.id} />
} 