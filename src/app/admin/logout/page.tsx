'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut()
      router.push('/admin')
    }

    logout()
  }, [router, supabase])

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Çıkış yapılıyor...</p>
      </div>
    </div>
  )
} 