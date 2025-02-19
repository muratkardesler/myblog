'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'

interface PostActionsProps {
  postId: string
  postTitle: string
}

export default function PostActions({ postId, postTitle }: PostActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (deleteError) throw deleteError

      router.refresh()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Blog yazısı silinirken bir hata oluştu.')
    } finally {
      setIsDeleting(false)
      setIsModalOpen(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Link
        href={`/admin/posts/${postId}/edit`}
        className="inline-flex items-center p-1 text-blue-600 hover:text-blue-800 transition-colors"
        title="Düzenle"
      >
        <FiEdit2 className="w-5 h-5" />
      </Link>
      
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center p-1 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
        disabled={isDeleting}
        title="Sil"
      >
        <FiTrash2 className="w-5 h-5" />
      </button>

      <DeleteConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Blog Yazısını Sil"
        message={`"${postTitle}" başlıklı blog yazısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
      />
    </div>
  )
} 