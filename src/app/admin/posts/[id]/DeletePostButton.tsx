'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FiTrash2 } from 'react-icons/fi'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'

interface DeletePostButtonProps {
  postId: string
  postTitle: string
}

export default function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      
      // Önce blog yazısını sil
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (deleteError) throw deleteError

      router.refresh()
      router.push('/admin/dashboard')
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Blog yazısı silinirken bir hata oluştu.')
    } finally {
      setIsDeleting(false)
      setIsModalOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        disabled={isDeleting}
      >
        <FiTrash2 className="mr-2 -ml-1 h-5 w-5" />
        {isDeleting ? 'Siliniyor...' : 'Sil'}
      </button>

      <DeleteConfirmModal
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Blog Yazısını Sil"
        message={`"${postTitle}" başlıklı blog yazısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
      />
    </>
  )
} 