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
          skills: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          what_i_do: string
          expertise: string
          created_at?: string
          what_i_do_title?: string
          expertise_title?: string
          contact_title?: string
          contact_description?: string
          skills?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          what_i_do?: string
          expertise?: string
          created_at?: string
          what_i_do_title?: string
          expertise_title?: string
          contact_title?: string
          contact_description?: string
          skills?: string
        }
        Relationships: []
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
          color?: string
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
        Relationships: []
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
        Relationships: []
      }
      page_visits: {
        Row: {
          id: string
          page: string
          ip_address: string
          user_agent: string
          referrer: string
          created_at: string
        }
        Insert: {
          id?: string
          page: string
          ip_address: string
          user_agent?: string
          referrer?: string
          created_at?: string
        }
        Update: {
          id?: string
          page?: string
          ip_address?: string
          user_agent?: string
          referrer?: string
          created_at?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          ip_address: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          ip_address: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          ip_address?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ]
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
          status: string
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
          excerpt?: string
          featured_image: string
          category_id: string
          status?: string
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
          status?: string
          is_featured?: boolean
          is_popular?: boolean
          created_at?: string
          updated_at?: string
          published_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          admin_name: string
          admin_title: string
          admin_description: string
          admin_image: string
          created_at: string
          contact_email: string
        }
        Insert: {
          id?: string
          admin_name: string
          admin_title: string
          admin_description: string
          admin_image: string
          created_at?: string
          contact_email?: string
        }
        Update: {
          id?: string
          admin_name?: string
          admin_title?: string
          admin_description?: string
          admin_image?: string
          created_at?: string
          contact_email?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          created_at: string
          updated_at: string
          last_login: string
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          full_name: string
          created_at?: string
          updated_at?: string
          last_login?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          created_at?: string
          updated_at?: string
          last_login?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      categories_with_post_count: {
        Row: {
          id: string
          name: string
          slug: string
          color: string
          created_at: string
          updated_at: string
          post_count: number
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
