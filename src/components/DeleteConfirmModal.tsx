'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DeleteConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Evet, Sil',
  cancelText = 'İptal',
  isLoading = false,
  onConfirm,
  onCancel
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
          {/* Arka plan overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div 
            className="flex min-h-full items-center justify-center p-4 z-10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-2xl shadow-purple-900/10 px-6 py-6 w-full max-w-md">
              {/* İkon ve Başlık */}
              <div className="flex flex-col items-center text-center mb-6">
                <motion.div 
                  className="mb-4 rounded-full bg-red-500/10 p-4 border border-red-500/20"
                  initial={{ rotateZ: -10 }}
                  animate={{ rotateZ: [0, -5, 0, 5, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <i className="ri-delete-bin-7-line text-3xl text-red-500"></i>
                </motion.div>
                <h3 className="text-xl font-semibold text-white">
                  {title}
                </h3>
                <p className="mt-3 text-gray-300">
                  {message}
                </p>
              </div>

              {/* Uyarı Metni */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700/30">
                <p className="flex items-center text-amber-400 mb-2">
                  <i className="ri-alert-line mr-2"></i>
                  <span className="font-medium">Dikkat</span>
                </p>
                <p className="text-sm text-gray-300">
                  Bu işlem geri alınamaz ve silinen kayıt tekrar getirilemez.
                </p>
              </div>

              {/* Butonlar */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
                <motion.button
                  type="button"
                  onClick={onCancel}
                  disabled={isDeleting || isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 bg-gray-700/50 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 backdrop-blur-sm border border-gray-600/30 order-2 sm:order-1"
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isDeleting || isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 shadow-lg shadow-red-700/30 flex items-center justify-center order-1 sm:order-2"
                >
                  {isDeleting || isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Siliniyor...
                    </>
                  ) : (
                    <>
                      <i className="ri-delete-bin-line mr-2"></i>
                      {confirmText}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 