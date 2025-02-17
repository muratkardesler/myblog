export default function HomePage() {
  return (
    <main className="p-8">
      <nav className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Ana Sayfa</h1>
      </nav>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Hoş Geldiniz</h2>
          <p className="text-gray-600">
            Merhaba! Bu benim kişisel blog sayfam.
          </p>
        </div>
      </div>
    </main>
  )
}
