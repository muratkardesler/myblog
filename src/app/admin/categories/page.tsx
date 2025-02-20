'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/lib/types';
import CategoryForm from '@/components/CategoryForm';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [mounted, setMounted] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    setMounted(true);
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      toast.error('Kategoriler yüklenirken bir hata oluştu.');
      return;
    }

    setCategories(data || []);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(`"${name}" kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`);
    
    if (confirmed) {
      setDeleteLoading(id);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        toast.error('Kategori silinirken bir hata oluştu.');
      } else {
        toast.success('Kategori başarıyla silindi.');
        await loadCategories();
      }
      setDeleteLoading(null);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    // Formu görünür alana kaydır
    document.getElementById('categoryForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Kategoriler</h1>
          <p className="text-gray-400 mt-2">Kategorileri yönetin ve düzenleyin</p>
        </div>
        <Link 
          href="/admin" 
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          Panele Dön
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-100">
                Mevcut Kategoriler
              </h2>
              <span className="text-sm text-gray-400">
                Toplam: {categories.length}
              </span>
            </div>
            
            <div className="space-y-4">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${category.color.replace('text', 'bg')}`}></div>
                    <div>
                      <h3 className="font-medium text-gray-100">{category.name}</h3>
                      <p className="text-sm text-gray-500">/{category.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      disabled={deleteLoading === category.id}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Sil"
                    >
                      {deleteLoading === category.id ? (
                        <i className="ri-loader-4-line animate-spin"></i>
                      ) : (
                        <i className="ri-delete-bin-line"></i>
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {categories.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <i className="ri-inbox-line text-4xl mb-2"></i>
                  <p>Henüz kategori eklenmemiş</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div id="categoryForm" className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">
              {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
            </h2>
            <CategoryForm
              category={editingCategory || undefined}
              onSuccess={() => {
                loadCategories();
                setEditingCategory(null);
                toast.success(editingCategory ? 'Kategori güncellendi.' : 'Yeni kategori eklendi.');
              }}
            />
            {editingCategory && (
              <button
                onClick={() => setEditingCategory(null)}
                className="mt-4 w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                Yeni Kategori Ekle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 