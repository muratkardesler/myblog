'use client';

import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface HtmlContentProps {
  content: string;
  className?: string;
}

export default function HtmlContent({ content, className = '' }: HtmlContentProps) {
  const [output, setOutput] = useState('');
  
  useEffect(() => {
    if (!content) return;
    
    // HTML içeriğini düzgün şekilde parse et
    let parsedContent = content;
    
    // Konsola içeriği yazdır
    console.log('HtmlContent içeriği:', content);
    
    // Eğer içerik HTML etiketleri içeriyorsa ancak düz metin olarak görünüyorsa
    if (
      content.includes('&lt;') || 
      content.includes('&gt;') || 
      content.includes('&quot;') || 
      content.includes('&#39;') || 
      content.includes('&amp;')
    ) {
      console.log('HTML karakterleri bulundu, dönüştürülüyor...');
      parsedContent = content
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
    }
    
    // DOMPurify ile içeriği temizle (XSS koruması)
    if (typeof window !== 'undefined') {
      const clean = DOMPurify.sanitize(parsedContent, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['target', 'class', 'style']
      });
      
      console.log('Temizlenmiş içerik:', clean);
      setOutput(clean);
    }
  }, [content]);
  
  // Eğer içerik yoksa boş div döndür
  if (!content) return <div className={className}></div>;
  
  return (
    <div 
      className={`blog-content ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: output || content 
      }}
    />
  );
} 