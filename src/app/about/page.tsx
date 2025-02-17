export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif mb-8">Hakkımda</h1>
        
        <div className="prose lg:prose-lg">
          <p>
            Merhaba! Ben Murat Kardeşler. Web teknolojileri ve yazılım geliştirme 
            konularında çalışıyorum.
          </p>
          
          <h2>Neler Yapıyorum?</h2>
          <p>
            Modern web teknolojileri üzerine çalışıyor, öğrendiklerimi blog yazıları 
            aracılığıyla paylaşıyorum. Özellikle React, Next.js, TypeScript ve 
            modern web geliştirme araçları konularında uzmanlaşıyorum.
          </p>
          
          <h2>İletişim</h2>
          <p>
            Benimle iletişime geçmek veya projelerim hakkında daha fazla bilgi 
            almak için sosyal medya hesaplarımı takip edebilirsiniz.
          </p>
          
          <div className="flex gap-4 mt-8">
            <a
              href="https://twitter.com/muratkardesler"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Twitter
            </a>
            <a
              href="https://github.com/muratkardesler"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 