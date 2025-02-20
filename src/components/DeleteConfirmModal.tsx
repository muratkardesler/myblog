'use client'

import { FiAlertTriangle } from 'react-icons/fi'
import { useState } from 'react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  onConfirm: () => Promise<void>
  message: string
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  onClose,
  onConfirm,
  message
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
    } finally {
      setIsDeleting(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Arka plan overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-xl bg-gray-800 border border-gray-700 px-6 py-6 shadow-xl transition-all w-full max-w-lg">
          {/* İkon ve Başlık */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4 rounded-full bg-red-500/10 p-3">
              <i className="ri-error-warning-line text-3xl text-red-500"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-100">
              Yazıyı Sil
            </h3>
            <p className="mt-2 text-gray-400">
              "{title}" yazısını silmek istediğinize emin misiniz?
            </p>
          </div>

          {/* Uyarı Listesi */}
          <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center">
                <i className="ri-information-line text-red-500 mr-2"></i>
                Bu işlem geri alınamaz
              </li>
              <li className="flex items-center">
                <i className="ri-delete-bin-line text-red-500 mr-2"></i>
                Yazıya ait tüm veriler silinecek
              </li>
              <li className="flex items-center">
                <i className="ri-chat-delete-line text-red-500 mr-2"></i>
                Yazıya ait yorumlar silinecek
              </li>
            </ul>
          </div>

          {/* Butonlar */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isDeleting ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Siliniyor...
                </>
              ) : (
                <>
                  <i className="ri-delete-bin-line mr-2"></i>
                  Evet, Sil
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 