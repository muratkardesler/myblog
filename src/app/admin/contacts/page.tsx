'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

interface MessageModalProps {
  contact: Contact | null;
  onClose: () => void;
}

function MessageModal({ contact, onClose }: MessageModalProps) {
  if (!contact) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-2xl bg-gray-900 border border-gray-700 w-full max-w-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-100">
              Mesaj Detayı
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors rounded-lg p-1 hover:bg-gray-800"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Sender Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800 p-3 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Gönderen</p>
                <p className="text-sm text-gray-100 truncate">{contact.name}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">E-posta</p>
                <p className="text-sm text-gray-100 truncate">{contact.email}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Tarih</p>
                <p className="text-sm text-gray-100 truncate">{formatDate(contact.created_at)}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Konu</p>
                <p className="text-sm text-gray-100 truncate">{contact.subject}</p>
              </div>
            </div>

            {/* Message */}
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">Mesaj</p>
              <div className="bg-gray-700/50 rounded-lg p-3 max-h-60 overflow-y-auto">
                <p className="text-sm text-gray-100 whitespace-pre-wrap break-words">
                  {contact.message}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-100 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Mesajlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Bu mesajı silmek istediğinize emin misiniz?');
    
    if (confirmed) {
      setDeleteLoading(id);
      try {
        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success('Mesaj başarıyla silindi.');
        await loadContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
        toast.error('Mesaj silinirken bir hata oluştu.');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Gelen Mesajlar</h1>
          <p className="text-gray-400 mt-2">İletişim formundan gelen mesajları yönetin</p>
        </div>
        <Link 
          href="/admin" 
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          Panele Dön
        </Link>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-2 text-gray-400">
              <i className="ri-loader-4-line animate-spin text-2xl"></i>
              <span>Yükleniyor...</span>
            </div>
          </div>
        ) : contacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Gönderen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">E-posta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Konu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-100">{contact.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">{contact.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">{contact.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(contact.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition-colors"
                          title="Mesajı Görüntüle"
                        >
                          <i className="ri-eye-line"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          disabled={deleteLoading === contact.id}
                          className="text-red-400 hover:text-red-300 hover:bg-gray-700 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Sil"
                        >
                          {deleteLoading === contact.id ? (
                            <i className="ri-loader-4-line animate-spin"></i>
                          ) : (
                            <i className="ri-delete-bin-line"></i>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="ri-mail-line text-4xl text-gray-500 mb-3"></i>
            <p className="text-gray-400">Henüz mesaj yok</p>
          </div>
        )}
      </div>

      <MessageModal
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
      />
    </div>
  );
} 