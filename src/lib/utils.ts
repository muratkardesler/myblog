export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200; // Ortalama okuma hızı
  
  // HTML etiketlerini temizle
  const plainText = content.replace(/<[^>]*>/g, '');
  
  const words = plainText.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  
  if (minutes < 1) return '1 dk okuma';
  return `${minutes} dk okuma`;
}

// HTML içeriğini düzgün şekilde işlemek için yardımcı fonksiyon
export function parseHtmlContent(content: string): string {
  if (!content) return '';
  
  // HTML etiketlerini düzgün şekilde parse et
  let parsedContent = content;
  
  // Eğer içerik HTML etiketleri içeriyorsa ancak düz metin olarak görünüyorsa
  if (
    content.includes('&lt;') || 
    content.includes('&gt;') || 
    content.includes('&quot;') || 
    content.includes('&#39;') || 
    content.includes('&amp;')
  ) {
    parsedContent = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }
  
  // YouTube iframe'lerini düzelt
  parsedContent = parsedContent.replace(
    /<iframe(.*?)src="(.*?)"(.*?)><\/iframe>/g, 
    '<div class="aspect-w-16 aspect-h-9 my-6"><iframe$1src="$2"$3 class="w-full h-full rounded-lg"></iframe></div>'
  );
  
  // Resim etiketlerini düzelt
  parsedContent = parsedContent.replace(
    /<img(.*?)src="(.*?)"(.*?)>/g, 
    '<img$1src="$2"$3 class="w-full h-auto my-6 rounded-lg" style="max-width: 100%; display: block; margin: 1.5rem auto;">'
  );
  
  // Boş paragrafları temizle
  parsedContent = parsedContent.replace(/<p>\s*<\/p>/g, '');
  
  return parsedContent;
} 