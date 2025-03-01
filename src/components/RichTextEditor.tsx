'use client'

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink, FaImage, FaYoutube, FaHeading } from 'react-icons/fa'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface EditorProps {
  content: string
  onChange: (content: string) => void
}

// HTML içeriğini düzgün şekilde parse eden yardımcı fonksiyon
function parseHtmlContent(content: string): string {
  if (!content) return '';
  
  // HTML etiketlerini düzgün şekilde parse et
  let parsedContent = content;
  
  // Eğer içerik HTML etiketleri içeriyorsa ancak düz metin olarak görünüyorsa
  if (content.includes('&lt;') || content.includes('&gt;')) {
    parsedContent = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }
  
  return parsedContent;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const [uploading, setUploading] = useState(false)
  const supabase = createClientComponentClient()

  if (!editor) {
    return null
  }

  const uploadImage = async (file: File) => {
    try {
      setUploading(true)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `blog-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      editor.chain().focus().setImage({ src: publicUrl }).run()
      toast.success('Görsel başarıyla eklendi.')
    } catch (error) {
      console.error('Görsel yükleme hatası:', error)
      toast.error('Görsel yüklenirken bir hata oluştu.')
    } finally {
      setUploading(false)
    }
  }

  const addYoutubeVideo = () => {
    const url = prompt('YouTube video URL\'sini girin:')
    
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 480,
      })
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL:', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-700 bg-gray-800 rounded-t-lg">
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
        title="Başlık"
      >
        <FaHeading />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('bold') ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
        title="Kalın"
      >
        <FaBold />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('italic') ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
        title="İtalik"
      >
        <FaItalic />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('underline') ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
        title="Altı Çizili"
      >
        <FaUnderline />
      </button>
      
      <div className="w-px h-6 mx-1 bg-gray-600"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('bulletList') ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
        title="Madde İşaretli Liste"
      >
        <FaListUl />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('orderedList') ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
        title="Numaralı Liste"
      >
        <FaListOl />
      </button>
      
      <div className="w-px h-6 mx-1 bg-gray-600"></div>
      
      <button
        onClick={setLink}
        className={`p-2 rounded hover:bg-gray-700 ${editor.isActive('link') ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
        title="Bağlantı Ekle"
      >
        <FaLink />
      </button>
      
      <label className={`p-2 rounded hover:bg-gray-700 cursor-pointer text-gray-300 ${uploading ? 'opacity-50 pointer-events-none' : ''}`} title="Görsel Ekle">
        <FaImage />
        <input 
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              uploadImage(file)
            }
          }}
          disabled={uploading}
        />
      </label>
      
      <button
        onClick={addYoutubeVideo}
        className="p-2 rounded hover:bg-gray-700 text-gray-300"
        title="YouTube Video Ekle"
      >
        <FaYoutube />
      </button>
    </div>
  )
}

export default function RichTextEditor({ content, onChange }: EditorProps) {
  // İçeriği parse et
  const parsedContent = parseHtmlContent(content);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'blog-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'blog-link',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        progressBarColor: 'white',
        modestBranding: true,
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'İçeriğinizi buraya yazın...',
      }),
    ],
    content: parsedContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-lg max-w-none focus:outline-none blog-content',
      },
    },
  })
  
  // İçerik değiştiğinde editörü güncelle
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(parsedContent);
    }
  }, [content, editor]);

  return (
    <div className="border border-gray-700 rounded-lg">
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="prose prose-invert max-w-none p-4 min-h-[400px] focus:outline-none blog-content"
      />
    </div>
  )
} 