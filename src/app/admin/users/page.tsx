'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getUsers } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Kullanıcılar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: !isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      
      await loadUsers();
      toast.success(isActive ? 'Kullanıcı pasif hale getirildi.' : 'Kullanıcı aktif hale getirildi.');
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Kullanıcı durumu güncellenirken bir hata oluştu.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Üyeler</h1>
          <p className="text-gray-400 mt-2">Siteye kayıtlı tüm üyeleri görüntüleyin</p>
        </div>
        <Link 
          href="/admin" 
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          Panele Dön
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center space-x-2 text-gray-400">
            <i className="ri-loader-4-line animate-spin text-2xl"></i>
            <span>Yükleniyor...</span>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <i className="ri-user-line text-5xl text-gray-500 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-300 mb-2">Henüz üye yok</h3>
          <p className="text-gray-400">Siteye kayıtlı üye bulunmuyor.</p>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kullanıcı Bilgisi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kayıt Tarihi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Son Giriş</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <i className="ri-user-line text-gray-400"></i>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-100">{user.full_name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_active ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-700 text-white">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-700 text-white">
                          Pasif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {user.last_login ? formatDate(user.last_login) : 'Hiç giriş yapmadı'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                        className={`p-2 rounded-lg ${user.is_active ? 'bg-red-900 hover:bg-red-800' : 'bg-green-900 hover:bg-green-800'} transition-colors`}
                        title={user.is_active ? 'Pasif hale getir' : 'Aktif hale getir'}
                      >
                        <i className={`ri-${user.is_active ? 'user-unfollow' : 'user-follow'}-line`}></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 