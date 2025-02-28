export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      about: {
        Row: {
          id: string
          title: string
          description: string
          what_i_do: string
          expertise: string
          created_at: string
          what_i_do_title: string
          expertise_title: string
          contact_title: string
          contact_description: string
          skills: string | null
        }
        Insert: {
          id?: string
          title?: string | null
          description?: string | null
          what_i_do?: string | null
          expertise?: string | null
          created_at?: string
          what_i_do_title?: string | null
          expertise_title?: string | null
          contact_title?: string | null
          contact_description?: string | null
          skills?: string | null
        }
        Update: {
          id?: string
          title?: string | null
          description?: string | null
          what_i_do?: string | null
          expertise?: string | null
          created_at?: string
          what_i_do_title?: string | null
          expertise_title?: string | null
          contact_title?: string | null
          contact_description?: string | null
          skills?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          color: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          name: string
          email: string
          subject: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          subject: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          subject?: string
          message?: string
          created_at?: string
        }
      }
      page_visits: {
        Row: {
          id: string
          page: string
          ip_address: string
          user_agent: string | null
          referrer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          page: string
          ip_address: string
          user_agent?: string | null
          referrer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          page?: string
          ip_address?: string
          user_agent?: string | null
          referrer?: string | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string
          featured_image: string
          category_id: string
          status: 'draft' | 'published'
          is_featured: boolean
          is_popular: boolean
          created_at: string
          updated_at: string
          published_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt: string
          featured_image: string
          category_id: string
          status?: 'draft' | 'published'
          is_featured?: boolean
          is_popular?: boolean
          created_at?: string
          updated_at?: string
          published_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string
          featured_image?: string
          category_id?: string
          status?: 'draft' | 'published'
          is_featured?: boolean
          is_popular?: boolean
          created_at?: string
          updated_at?: string
          published_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          page_id: string
          title: string
          content: string
          order_no: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page_id: string
          title: string
          content: string
          order_no: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          title?: string
          content?: string
          order_no?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          admin_name: string
          admin_title: string
          admin_description: string
          admin_image: string
          created_at: string
          contact_email: string | null
        }
        Insert: {
          id?: string
          admin_name?: string | null
          admin_title?: string | null
          admin_description?: string | null
          admin_image?: string | null
          created_at?: string
          contact_email?: string | null
        }
        Update: {
          id?: string
          admin_name?: string | null
          admin_title?: string | null
          admin_description?: string | null
          admin_image?: string | null
          created_at?: string
          contact_email?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 