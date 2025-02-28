'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  return (
    <>
      <footer className="bg-gradient-to-b from-gray-900 to-gray-800 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 text-white font-bold text-xl">
                  M
                </div>
                <span className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
                  Murat Blog
                </span>
              </Link>
              <p className="mt-4 text-gray-600">Teknoloji, tasarım ve daha fazlası hakkında yazılar.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-100 mb-4">Hızlı Bağlantılar</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-600 hover:text-primary">Anasayfa</Link></li>
                <li><Link href="/about" className="text-gray-600 hover:text-primary">Hakkımda</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-primary">Blog</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-primary">İletişim</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-100 mb-4">Sosyal Medya</h4>
              <div className="flex space-x-4">
                <a 
                  href="https://linkedin.com/in/muratkardesler" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700 hover:border-primary hover:bg-primary/10 transition-all"
                >
                  <i className="ri-linkedin-line"></i>
                </a>
                <a 
                  href="https://github.com/muratkardesler" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700 hover:border-primary hover:bg-primary/10 transition-all"
                >
                  <i className="ri-github-line"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 Murat Blog. Tüm hakları saklıdır.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button 
                onClick={() => setShowPrivacyModal(true)} 
                className="text-gray-600 hover:text-primary transition-colors"
                type="button"
              >
                Gizlilik Politikası
              </button>
              <button 
                onClick={() => setShowTermsModal(true)} 
                className="text-gray-600 hover:text-primary transition-colors"
                type="button"
              >
                Kullanım Koşulları
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Gizlilik Politikası Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in" 
            onClick={() => setShowPrivacyModal(false)}
          ></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-gray-800 border border-gray-700 rounded-2xl shadow-xl animate-slide-up">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Gizlilik Politikası</h2>
                  <button 
                    onClick={() => setShowPrivacyModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>
                <div className="space-y-6 text-gray-300 max-h-[70vh] overflow-y-auto pr-4">
                  <section>
                    <h3 className="text-xl font-semibold text-white mb-4">1. Toplanan Bilgiler</h3>
                    <p className="mb-4">Web sitemizi kullanırken aşağıdaki bilgileri toplayabiliriz:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>İsim ve e-posta adresi (iletişim formu kullanıldığında)</li>
                      <li>IP adresi ve tarayıcı bilgileri</li>
                      <li>Çerezler aracılığıyla toplanan kullanım verileri</li>
                      <li>Google Analytics tarafından toplanan anonim kullanım istatistikleri</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-4">2. Bilgilerin Kullanımı</h3>
                    <p className="mb-4">Topladığımız bilgileri aşağıdaki amaçlarla kullanıyoruz:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Web sitemizi geliştirmek ve kullanıcı deneyimini iyileştirmek</li>
                      <li>İletişim formları aracılığıyla gönderilen mesajlara yanıt vermek</li>
                      <li>Site kullanımını analiz etmek ve istatistiksel veriler oluşturmak</li>
                      <li>Yasal yükümlülüklerimizi yerine getirmek</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-4">3. Bilgi Güvenliği</h3>
                    <p>
                      Kişisel bilgilerinizin güvenliğini sağlamak için uygun teknik ve organizasyonel önlemler alıyoruz. 
                      Ancak, internet üzerinden veri iletiminin %100 güvenli olmadığını unutmayın.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-4">4. Çerezler ve Takip</h3>
                    <p>
                      Web sitemiz çerezleri ve benzer teknolojileri kullanmaktadır. Bu teknolojiler, site performansını 
                      artırmak ve kullanıcı deneyimini iyileştirmek için kullanılır. Tarayıcı ayarlarınızdan çerezleri 
                      devre dışı bırakabilirsiniz.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-4">5. Üçüncü Taraf Hizmetler</h3>
                    <p>
                      Web sitemiz Google Analytics gibi üçüncü taraf hizmetleri kullanmaktadır. Bu hizmetler kendi gizlilik 
                      politikalarına sahiptir ve toplanan veriler onların politikalarına tabidir.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-4">6. Veri Paylaşımı</h3>
                    <p>
                      Kişisel bilgilerinizi yasal zorunluluklar dışında üçüncü taraflarla paylaşmıyoruz. Verileriniz 
                      yalnızca hizmet sağlayıcılarımızla ve yasal yükümlülüklerimiz kapsamında paylaşılabilir.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-4">7. İletişim</h3>
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
          </div>
        </div>
      )}

      {/* Kullanım Koşulları Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in" 
            onClick={() => setShowTermsModal(false)}
          ></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-gray-800 border border-gray-700 rounded-2xl shadow-xl animate-slide-up">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Kullanım Koşulları</h2>
                  <button 
                    onClick={() => setShowTermsModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>
                <div className="space-y-6 text-gray-300 max-h-[70vh] overflow-y-auto pr-4">
                  <section>
                    <h3 className="text-xl font-semibold text-white mb-4">1. Kabul Edilen Şartlar</h3>
                    <p>
                      Bu web sitesini kullanarak, bu kullanım koşullarını kabul etmiş olursunuz. Bu koşulları kabul etmiyorsanız, 
                      lütfen sitemizi kullanmayın.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-4">2. Kullanım Lisansı</h3>
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
                    <h3 className="text-xl font-semibold text-white mb-4">3. Sorumluluk Reddi</h3>
                    <p>
                      Web sitemizdeki içerik "olduğu gibi" sunulmaktadır. Bilgilerin doğruluğu, eksiksizliği veya güncelliği 
                      konusunda hiçbir garanti vermiyoruz. Sitemizi kullanmanızdan kaynaklanan herhangi bir zarardan sorumlu değiliz.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-4">4. Kullanıcı Davranışı</h3>
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
                    <h3 className="text-xl font-semibold text-white mb-4">5. Hesap Güvenliği</h3>
                    <p>
                      Eğer bir hesap oluşturursanız, hesap bilgilerinizin güvenliğinden siz sorumlusunuz. Hesabınızla yapılan 
                      tüm işlemlerden siz sorumlu olacaksınız.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-4">6. Değişiklikler</h3>
                    <p>
                      Bu kullanım koşullarını herhangi bir zamanda değiştirme hakkını saklı tutarız. Değişiklikler web sitemizde 
                      yayınlandığı anda yürürlüğe girer.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-white mb-4">7. İletişim</h3>
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
          </div>
        </div>
      )}
    </>
  );
} 