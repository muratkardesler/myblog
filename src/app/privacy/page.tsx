'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="min-h-screen bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Gizlilik Politikası</h1>
            
            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">1. Toplanan Bilgiler</h2>
                <p className="mb-4">
                  Web sitemizi kullanırken aşağıdaki bilgileri toplayabiliriz:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>İsim ve e-posta adresi (iletişim formu kullanıldığında)</li>
                  <li>IP adresi ve tarayıcı bilgileri</li>
                  <li>Çerezler aracılığıyla toplanan kullanım verileri</li>
                  <li>Google Analytics tarafından toplanan anonim kullanım istatistikleri</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">2. Bilgilerin Kullanımı</h2>
                <p className="mb-4">
                  Topladığımız bilgileri aşağıdaki amaçlarla kullanıyoruz:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Web sitemizi geliştirmek ve kullanıcı deneyimini iyileştirmek</li>
                  <li>İletişim formları aracılığıyla gönderilen mesajlara yanıt vermek</li>
                  <li>Site kullanımını analiz etmek ve istatistiksel veriler oluşturmak</li>
                  <li>Yasal yükümlülüklerimizi yerine getirmek</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">3. Bilgi Güvenliği</h2>
                <p>
                  Kişisel bilgilerinizin güvenliğini sağlamak için uygun teknik ve organizasyonel önlemler alıyoruz. 
                  Ancak, internet üzerinden veri iletiminin %100 güvenli olmadığını unutmayın.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">4. Çerezler ve Takip</h2>
                <p>
                  Web sitemiz çerezleri ve benzer teknolojileri kullanmaktadır. Bu teknolojiler, site performansını 
                  artırmak ve kullanıcı deneyimini iyileştirmek için kullanılır. Tarayıcı ayarlarınızdan çerezleri 
                  devre dışı bırakabilirsiniz.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">5. Üçüncü Taraf Hizmetler</h2>
                <p>
                  Web sitemiz Google Analytics gibi üçüncü taraf hizmetleri kullanmaktadır. Bu hizmetler kendi gizlilik 
                  politikalarına sahiptir ve toplanan veriler onların politikalarına tabidir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">6. Veri Paylaşımı</h2>
                <p>
                  Kişisel bilgilerinizi yasal zorunluluklar dışında üçüncü taraflarla paylaşmıyoruz. Verileriniz 
                  yalnızca hizmet sağlayıcılarımızla ve yasal yükümlülüklerimiz kapsamında paylaşılabilir.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">7. İletişim</h2>
                <p>
                  Gizlilik politikamız hakkında sorularınız varsa, lütfen iletişim sayfamız üzerinden bizimle 
                  iletişime geçin.
                </p>
              </section>

              <section>
                <p className="text-sm text-gray-400">
                  Son güncelleme: Mart 2024
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 