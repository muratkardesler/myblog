'use client';

import { useState, useEffect } from 'react';
import { User, WorkLog } from '@/lib/types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function UserReportsPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDays: 0,
    completedDays: 0,
    totalDuration: 0,
    completionPercentage: 0,
  });

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  // Kullanıcı verisini yükleme
  const loadUserData = async () => {
    try {
      setLoading(true);
      console.log('Kullanıcı ID:', userId);

      // API üzerinden kullanıcı ve ayarları getir
      const response = await fetch(`/api/admin/user?userId=${userId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Kullanıcı bilgileri alınamadı: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API yanıtı:', data);
      
      if (!data.user) {
        toast.error('Kullanıcı bilgileri alınamadı.');
        return;
      }

      setUser(data.user);
      
      let start = '';
      let end = '';

      if (data.settings) {
        console.log('Kullanıcı ayarları:', data.settings);
        start = data.settings.start_date;
        end = data.settings.end_date;
      } else {
        console.log('Kullanıcı ayarları bulunamadı, varsayılan değerler kullanılıyor');
        // Ay başlangıç ve bitiş tarihleri (24'ünden 24'üne)
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        let startMonth = currentMonth - 1;
        let startYear = currentYear;

        if (startMonth === 0) {
          startMonth = 12;
          startYear = currentYear - 1;
        }

        // Başlangıç: Önceki ayın 24'ü
        const startDate = new Date(startYear, startMonth - 1, 24);
        // Bitiş: Seçilen ayın 24'ü
        const endDate = new Date(currentYear, currentMonth - 1, 24);

        start = formatDateToYYYYMMDD(startDate);
        end = formatDateToYYYYMMDD(endDate);
      }

      setStartDate(start);
      setEndDate(end);
      console.log('Tarih aralığı:', start, '-', end);

      // İş kayıtlarını getir
      await loadWorkLogs(userId, start, end);

    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      toast.error('Veri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // İş kayıtlarını belirlenen tarih aralığına göre getir
  const loadWorkLogs = async (userId: string, start: string, end: string) => {
    try {
      console.log('İş kayıtları yükleniyor - UserId:', userId, 'Tarih aralığı:', start, '-', end);
      
      // RLS politikalarını bypass etmek için server-side endpoint kullanma
      const response = await fetch(`/api/admin/work-logs?userId=${userId}&startDate=${start}&endDate=${end}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`İş kayıtları alınamadı: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Yüklenen iş kayıtları:', data);
      
      setWorkLogs(data || []);
      calculateStats(data || [], start, end);
    } catch (error) {
      console.error('İş kayıtları yüklenirken hata:', error);
      toast.error('İş kayıtları alınamadı.');
    }
  };

  // İstatistikleri hesapla
  const calculateStats = (logs: WorkLog[], startDate: string, endDate: string) => {
    // İş günlerini hesapla
    const workDays = calculateWorkDays(new Date(startDate), new Date(endDate));
    
    // Toplam süre hesapla
    const totalDuration = logs.reduce((sum, log) => sum + parseFloat(String(log.duration)), 0);
    
    // Kayıt yapılan benzersiz günler
    const uniqueDatesSet = new Set(logs.map(log => {
      return log.date.includes('T') ? log.date.split('T')[0] : log.date;
    }));
    const completedDays = uniqueDatesSet.size;
    
    // Yüzde hesapla
    const percentage = workDays > 0 ? (completedDays / workDays) * 100 : 0;
    
    setStats({
      totalDays: workDays,
      completedDays,
      totalDuration,
      completionPercentage: percentage
    });
  };

  // İki tarih arasındaki iş günlerini hesapla
  const calculateWorkDays = (startDate: Date, endDate: Date): number => {
    let workDays = 0;
    const currentDate = new Date(startDate);
    
    // Her gün için kontrol
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // 0: Pazar, 6: Cumartesi - hafta içi ise say
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
      // Sonraki güne geç
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workDays;
  };

  // Tarih formatını YYYY-MM-DD şeklinde döndüren yardımcı fonksiyon
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Tarih aralığını değiştir
  const handleDateRangeChange = async () => {
    try {
      if (!startDate || !endDate) {
        toast.error('Lütfen başlangıç ve bitiş tarihlerini seçin.');
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        toast.error('Başlangıç tarihi, bitiş tarihinden sonra olamaz.');
        return;
      }

      console.log('Tarih aralığı güncelleniyor:', startDate, '-', endDate);
      
      // Mevcut tarih ile karşılaştır - bu tarihler gelecekte olabilir,
      // Gelecek tarihler problem değil, kullanıcıya uyarı verilmeyecek
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      await loadWorkLogs(userId, startDate, endDate);
      
      toast.success('Rapor başarıyla güncellendi.');
    } catch (error) {
      console.error('Tarih aralığı güncellenirken hata:', error);
      toast.error('Rapor güncellenirken bir hata oluştu.');
    }
  };

  // Excel raporu oluştur ve indir
  const handleExportExcel = () => {
    try {
      if (workLogs.length === 0) {
        toast.error('İndirilecek rapor verisi bulunamadı.');
        return;
      }
      
      // Excel için veri oluştur
      const workbook = XLSX.utils.book_new();
      
      // İş detayları sayfası oluştur
      const excelData = workLogs.map(log => ({
        'Tarih': new Date(log.date).toLocaleDateString('tr-TR'),
        'Danışman': user?.full_name || '',
        'Yapılan İş / Problem&Çözüm': log.description,
        'Süre': parseFloat(String(log.duration)).toFixed(2),
        'Proje / Bölüm': log.project_code,
        'Kontak Kişi': log.contact_person || '',
        'Log Time': log.log_time ? '✓' : '✗'
      }));
      
      const detailsSheet = XLSX.utils.json_to_sheet(excelData);
      
      // Sütun genişliklerini ayarla
      const wscols = [
        { wch: 12 },  // Tarih
        { wch: 20 },  // Danışman
        { wch: 50 },  // Yapılan İş / Problem&Çözüm
        { wch: 8 },   // Süre
        { wch: 15 },  // Proje / Bölüm
        { wch: 20 },  // Kontak Kişi
        { wch: 10 }   // Log Time
      ];
      
      detailsSheet['!cols'] = wscols;
      XLSX.utils.book_append_sheet(workbook, detailsSheet, 'İş Raporu');
      
      // Dosyayı indir
      const dateRange = `${startDate.split('-').reverse().join('.')} - ${endDate.split('-').reverse().join('.')}`;
      XLSX.writeFile(workbook, `İş_Raporu_${user?.full_name?.replace(/\s+/g, '_')}_${dateRange}.xlsx`);
      toast.success('Rapor başarıyla indirildi.');
    } catch (error) {
      console.error('Excel dosyası oluşturulurken hata:', error);
      toast.error('Rapor oluşturulurken bir hata oluştu.');
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

  // Kullanıcı bulunamadı
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Kullanıcı Bulunamadı</h1>
          </div>
          <Link 
            href="/admin/users" 
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Üyelere Dön
          </Link>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
          <i className="ri-error-warning-line text-5xl text-gray-500 mb-4"></i>
          <h3 className="text-xl font-medium text-gray-300 mb-2">Kullanıcı bulunamadı</h3>
          <p className="text-gray-400">Aradığınız kullanıcı bulunamadı veya silinmiş olabilir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">{user.full_name} - İş Raporları</h1>
          <p className="text-gray-400 mt-2">{user.email}</p>
        </div>
        <Link 
          href="/admin/users" 
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          Üyelere Dön
        </Link>
      </div>

      {/* Tarih Aralığı Seçimi */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-medium text-white mb-4">Tarih Aralığı Seçin</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Başlangıç Tarihi</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Bitiş Tarihi</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDateRangeChange}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors"
            >
              Raporu Güncelle
            </button>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-medium text-white mb-4">Rapor Özeti</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm text-gray-400 mb-1">Toplam İş Günü</h3>
            <p className="text-2xl font-bold text-white">{stats.totalDays}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm text-gray-400 mb-1">Çalışılan Günler</h3>
            <p className="text-2xl font-bold text-white">{stats.completedDays}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm text-gray-400 mb-1">Toplam Çalışma</h3>
            <p className="text-2xl font-bold text-white">{stats.totalDuration.toFixed(2)} <span className="text-sm text-gray-400">birim</span></p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm text-gray-400 mb-1">Tamamlanma Oranı</h3>
            <p className="text-2xl font-bold text-white">{stats.completionPercentage.toFixed(0)}%</p>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${Math.min(stats.completionPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* İş Kayıtları */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden mb-8">
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-xl font-medium text-white">İş Kayıtları</h2>
          {workLogs.length > 0 && (
            <button
              onClick={handleExportExcel}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-4 py-2 transition-colors"
            >
              <i className="ri-file-excel-2-line mr-2"></i>
              Excel Olarak İndir
            </button>
          )}
        </div>

        {workLogs.length === 0 ? (
          <div className="p-8 text-center">
            <i className="ri-file-list-3-line text-5xl text-gray-500 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-300 mb-2">Kayıt Bulunamadı</h3>
            <p className="text-gray-400">Seçilen tarih aralığında iş kaydı bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Proje / Bölüm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Açıklama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kontak Kişi</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Süre</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Log Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {workLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(log.date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {log.project_code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="max-w-xs md:max-w-md truncate">{log.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {log.contact_person || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-300">
                      {parseFloat(String(log.duration)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {log.log_time ? (
                        <span className="text-green-400 font-bold">✓</span>
                      ) : (
                        <span className="text-red-400 font-bold">✗</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 