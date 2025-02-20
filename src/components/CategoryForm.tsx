'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/lib/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface CategoryFormProps {
  category?: Category;
  onSuccess: () => void;
}

export default function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [color, setColor] = useState(category?.color || 'text-purple-500');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // Kategori adı değiştiğinde otomatik slug oluştur
  useEffect(() => {
    if (!category) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  }, [name, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (category) {
        const { error } = await supabase
          .from('categories')
          .update({
            name,
            slug,
            color
          })
          .eq('id', category.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({
            name,
            slug,
            color
          });

        if (error) throw error;
      }

      onSuccess();
      if (!category) {
        setName('');
        setSlug('');
        setColor('text-purple-500');
      }
    } catch (error: any) {
      console.error('Kategori kaydedilirken hata oluştu:', error);
      setError(error.message || 'Kategori kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }

    setLoading(false);
  };

  const colors = [
    { value: 'text-purple-500', label: 'Mor', bg: 'bg-purple-500' },
    { value: 'text-blue-500', label: 'Mavi', bg: 'bg-blue-500' },
    { value: 'text-green-500', label: 'Yeşil', bg: 'bg-green-500' },
    { value: 'text-red-500', label: 'Kırmızı', bg: 'bg-red-500' },
    { value: 'text-yellow-500', label: 'Sarı', bg: 'bg-yellow-500' },
    { value: 'text-pink-500', label: 'Pembe', bg: 'bg-pink-500' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
          Kategori Adı
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
          placeholder="Örn: Teknoloji"
          required
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-1">
          URL Adresi
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">/</span>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full pl-8 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 focus:outline-none focus:border-primary"
            placeholder="teknoloji"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Renk
        </label>
        <div className="grid grid-cols-3 gap-3">
          {colors.map(({ value, label, bg }) => (
            <label
              key={value}
              className={`
                flex items-center justify-center p-3 rounded-xl cursor-pointer border-2 transition-all
                ${color === value ? 'border-primary bg-gray-900' : 'border-transparent bg-gray-900 hover:border-gray-700'}
              `}
            >
              <input
                type="radio"
                name="color"
                value={value}
                checked={color === value}
                onChange={(e) => setColor(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${bg}`}></div>
                <span className="text-sm text-gray-300">{label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full !rounded-xl bg-primary text-white px-6 py-3 font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <i className="ri-loader-4-line animate-spin mr-2"></i>
              Kaydediliyor...
            </span>
          ) : (
            <span>{category ? 'Güncelle' : 'Kategori Ekle'}</span>
          )}
        </button>
      </div>
    </form>
  );
} 