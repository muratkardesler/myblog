import { useState, useEffect } from 'react';
import { WorkLog } from '../page';

interface CalendarProps {
  month: number;
  year: number;
  workLogs: WorkLog[];
  onSelectDate: (date: string) => void;
}

export default function Calendar({ month, year, workLogs, onSelectDate }: CalendarProps) {
  const [calendarDays, setCalendarDays] = useState<{ date: Date; hasLog: boolean; duration: number; hasFullDuration: boolean }[]>([]);

  // Ay adları (Türkçe)
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Hafta günleri (Türkçe)
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts', 'Paz'];

  useEffect(() => {
    const generateCalendarDays = () => {
      // Ayın ilk günü
      const firstDay = new Date(year, month - 1, 1);
      
      // Bir önceki ayın son günleri için ofseti hesapla (0=Pazar, 1=Pazartesi... olduğundan (firstDay.getDay() || 7) - 1 hesabı)
      const offset = (firstDay.getDay() || 7) - 1;
      
      // Ayın son günü
      const lastDay = new Date(year, month, 0);
      const daysInMonth = lastDay.getDate();
      
      // Takvimde gösterilecek günleri oluştur
      const days = [];
      
      // Önceki aydan gelen günler (dolgu)
      for (let i = 0; i < offset; i++) {
        const prevMonthDay = new Date(year, month - 2, lastDay.getDate() - i);
        days.unshift({ 
          date: prevMonthDay, 
          hasLog: false,
          duration: 0,
          hasFullDuration: false
        });
      }
      
      // Ayın günleri
      for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(year, month - 1, i);
        // ISO formatı YYYY-MM-DD olmalı ve yerel saati dikkate almamalı
        const dateString = formatDateToYYYYMMDD(currentDate);
        
        // Bu tarihte kayıt var mı kontrolü - tarih formatını doğru şekilde karşılaştır
        const logsOnThisDay = workLogs.filter(log => {
          const logDate = log.date.includes('T') 
            ? log.date.split('T')[0] 
            : log.date;
          return logDate === dateString;
        });
        
        // Günün toplam duration değerini hesapla
        const totalDuration = logsOnThisDay.reduce((total, log) => total + parseFloat(String(log.duration)), 0);
        
        // Duration değeri tam 1.00 mi kontrol et
        const hasFullDurationLog = logsOnThisDay.some(log => parseFloat(String(log.duration)) === 1.00);
        
        days.push({
          date: currentDate,
          hasLog: logsOnThisDay.length > 0,
          duration: totalDuration,
          hasFullDuration: hasFullDurationLog || totalDuration === 1.00
        });
      }
      
      // Sonraki aydan gelen günler (dolgu) - toplam 42 gün olacak şekilde (6 hafta)
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        days.push({ 
          date: new Date(year, month, i), 
          hasLog: false,
          duration: 0,
          hasFullDuration: false
        });
      }
      
      setCalendarDays(days);
    };
    
    generateCalendarDays();
  }, [month, year, workLogs]);

  // Tarih formatını YYYY-MM-DD şeklinde döndüren yardımcı fonksiyon
  const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Gün tıklandığında çalışacak fonksiyon
  const handleDayClick = (date: Date) => {
    // Sadece geçerli ayın günlerine tıklanabilsin
    if (date.getMonth() === month - 1) {
      onSelectDate(formatDateToYYYYMMDD(date));
    }
  };

  // Ayın başlık metni
  const calendarTitle = `${monthNames[month - 1]} ${year}`;

  return (
    <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-medium text-white">Aylık Takvim</h2>
        <div className="text-purple-300 font-medium">{calendarTitle}</div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {/* Haftanın günleri */}
        {weekDays.map((day, index) => (
          <div key={index} className="text-center text-gray-400 text-xs font-medium py-2">
            {day}
          </div>
        ))}
        
        {/* Takvim günleri */}
        {calendarDays.map((day, index) => {
          const isCurrentMonth = day.date.getMonth() === month - 1;
          const isToday = new Date().toDateString() === day.date.toDateString();
          
          return (
            <div 
              key={index} 
              onClick={() => handleDayClick(day.date)}
              title={day.hasLog ? `${day.date.toLocaleDateString('tr-TR')} - ${day.duration} birim çalışma` : day.date.toLocaleDateString('tr-TR')}
              className={`
                relative p-2 text-center rounded-md transition-colors min-h-14
                ${isCurrentMonth ? 'bg-gray-800/40 cursor-pointer' : 'bg-gray-800/10 text-gray-500'}
                ${isToday ? 'ring-2 ring-purple-500' : ''}
                ${day.hasLog ? 'hover:bg-purple-500/10' : 'hover:bg-gray-700/20'}
              `}
            >
              <div className="text-xs font-medium">{day.date.getDate()}</div>
              
              {day.hasLog && (
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className={`w-full h-full rounded-md ${day.hasFullDuration ? 'bg-purple-500' : 'bg-yellow-500'}`}></div>
                </div>
              )}
              
              {day.hasLog && (
                <div className="relative z-10 flex items-center justify-center mt-1">
                  <div className="flex flex-col items-center text-xs">
                    {day.hasFullDuration ? (
                      <i className="ri-checkbox-circle-fill text-purple-400 text-lg"></i>
                    ) : (
                      <i className="ri-time-line text-yellow-400 text-lg"></i>
                    )}
                    {day.duration > 0 && (
                      <span className={`mt-1 font-medium ${day.hasFullDuration ? 'text-white' : 'text-yellow-300'}`}>
                        {day.duration}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-400">
          <i className="ri-checkbox-circle-fill text-purple-400 mr-1"></i>
          <span>1.00 birim tamamlanan günler</span>
        </div>
        <div className="flex items-center text-xs text-gray-400">
          <i className="ri-time-line text-yellow-400 mr-1"></i>
          <span>Kısmi çalışma günleri</span>
        </div>
      </div>
    </div>
  );
} 