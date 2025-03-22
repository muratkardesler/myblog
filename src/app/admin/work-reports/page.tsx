'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function WorkReportsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
        toast.error('Kullanıcılar yüklenemedi.');
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      toast.error('Kullanıcılar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  // Yükleniyor durumu
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center space-x-2 text-gray-400">
            <i className="ri-loader-4-line animate-spin text-2xl"></i>
            <span>Yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">İş Takip Raporları</h1>
          <p className="text-gray-400 mt-2">Tüm kullanıcıların iş takip raporlarını görüntüleyin</p>
        </div>
        <Link 
          href="/admin" 
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          Admin Panele Dön
        </Link>
      </div>

      {/* Kullanıcı Listesi */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-medium text-white">Kullanıcılar</h2>
          <p className="text-gray-400 mt-1">Rapor görüntülemek için bir kullanıcı seçin</p>
        </div>

        {users.length === 0 ? (
          <div className="p-8 text-center">
            <i className="ri-user-line text-5xl text-gray-500 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-300 mb-2">Kullanıcı Bulunamadı</h3>
            <p className="text-gray-400">Sistemde kayıtlı kullanıcı bulunmuyor.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div key={user.id} className="bg-gray-750 border border-gray-700 rounded-xl p-5 hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-gray-300">
                      <i className="ri-user-line text-xl"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium text-white truncate">
                        {user.full_name}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="inline-flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${user.is_active ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                      <span className="text-xs text-gray-400">{user.is_active ? 'Aktif' : 'Pasif'}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex">
                    <Link
                      href={`/admin/users/${user.id}/reports`}
                      className="w-full flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg px-4 py-2 text-sm font-medium"
                    >
                      <i className="ri-file-chart-line mr-2"></i>
                      İş Raporları Görüntüle
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 