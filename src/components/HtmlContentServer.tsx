import React from 'react';

interface HtmlContentServerProps {
  content: string;
  className?: string;
}

export default function HtmlContentServer({ content, className = '' }: HtmlContentServerProps) {
  // Eğer içerik yoksa boş div döndür
  if (!content) return <div className={className}></div>;
  
  return (
    <div 
      className={`blog-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
} 