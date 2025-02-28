'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="min-h-screen bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Kullanım Koşulları</h1>
            
            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">1. Kabul Edilen Şartlar</h2>
                <p>
                  Bu web sitesini kullanarak, bu kullanım koşullarını kabul etmiş olursunuz. Bu koşulları kabul etmiyorsanız, 
                  lütfen sitemizi kullanmayın.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">2. Kullanım Lisansı</h2>
                <p className="mb-4">
                  Bu web sitesinin içeriği telif hakkı ve diğer fikri mülkiyet hakları ile korunmaktadır. Size aşağıdaki 
                  şartlarla sınırlı bir lisans verilmektedir:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>İçeriği yalnızca kişisel, ticari olmayan amaçlarla görüntüleyebilirsiniz</li>
                  <li>İçeriği kopyalayamaz, değiştiremez veya dağıtamazsınız</li>
                  <li>İçeriği yeniden yayınlayamaz veya satışa sunamazsınız</li>
                  <li>Tüm telif hakkı ve diğer mülkiyet bildirimlerini korumalısınız</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">3. Sorumluluk Reddi</h2>
                <p>
                  Web sitemizdeki içerik "olduğu gibi" sunulmaktadır. Bilgilerin doğruluğu, eksiksizliği veya güncelliği 
                  konusunda hiçbir garanti vermiyoruz. Sitemizi kullanmanızdan kaynaklanan herhangi bir zarardan sorumlu değiliz.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">4. Kullanıcı Davranışı</h2>
                <p className="mb-4">
                  Web sitemizi kullanırken aşağıdaki davranışlardan kaçınmalısınız:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Yasadışı, zararlı veya kötü niyetli içerik paylaşmak</li>
                  <li>Başkalarının haklarını ihlal etmek</li>
                  <li>Siteye zarar verecek faaliyetlerde bulunmak</li>
                  <li>İstenmeyen reklam veya spam içerik göndermek</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">5. Hesap Güvenliği</h2>
                <p>
                  Eğer bir hesap oluşturursanız, hesap bilgilerinizin güvenliğinden siz sorumlusunuz. Hesabınızla yapılan 
                  tüm işlemlerden siz sorumlu olacaksınız.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">6. Değişiklikler</h2>
                <p>
                  Bu kullanım koşullarını herhangi bir zamanda değiştirme hakkını saklı tutarız. Değişiklikler web sitemizde 
                  yayınlandığı anda yürürlüğe girer.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">7. İletişim</h2>
                <p>
                  Kullanım koşulları hakkında sorularınız varsa, lütfen iletişim sayfamız üzerinden bizimle iletişime geçin.
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