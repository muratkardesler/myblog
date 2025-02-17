export default function BlogPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif mb-8">Blog Yazılarım</h1>
        <div className="space-y-12">
          {/* Blog yazıları buraya gelecek */}
          <div className="space-y-4">
            <h2 className="text-2xl font-serif">
              <a href="#" className="hover:text-blue-600">
                Modern Web Geliştirme Teknikleri
              </a>
            </h2>
            <p className="text-gray-600">
              Web geliştirme dünyasında kullanılan modern teknikleri ve best practice&apos;leri 
              inceliyoruz.
            </p>
            <div className="text-sm text-gray-500">15 Şubat 2024</div>
          </div>
        </div>
      </div>
    </div>
  )
} 