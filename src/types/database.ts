// Database types generated from Supabase schema
// This file should be regenerated when the database schema changes

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          role: 'customer' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          role?: 'customer' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          role?: 'customer' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          type: 'billing' | 'shipping'
          street: string
          city: string
          state: string
          zip_code: string
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'billing' | 'shipping'
          street: string
          city: string
          state: string
          zip_code: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'billing' | 'shipping'
          street?: string
          city?: string
          state?: string
          zip_code?: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      product_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          sku: string
          name: string
          description: string
          category_id: string
          make: string
          model: string
          year: number
          part_number: string | null
          condition: 'new' | 'used' | 'refurbished'
          price: number
          original_price: number | null
          quantity: number
          weight: number | null
          dimensions: any | null
          specifications: any | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku: string
          name: string
          description: string
          category_id: string
          make: string
          model: string
          year: number
          part_number?: string | null
          condition: 'new' | 'used' | 'refurbished'
          price: number
          original_price?: number | null
          quantity?: number
          weight?: number | null
          dimensions?: any | null
          specifications?: any | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string
          name?: string
          description?: string
          category_id?: string
          make?: string
          model?: string
          year?: number
          part_number?: string | null
          condition?: 'new' | 'used' | 'refurbished'
          price?: number
          original_price?: number | null
          quantity?: number
          weight?: number | null
          dimensions?: any | null
          specifications?: any | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          is_primary: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          is_primary?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          alt_text?: string | null
          is_primary?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_compatibility: {
        Row: {
          id: string
          product_id: string
          make: string
          model: string
          year_start: number
          year_end: number
          engine: string | null
          trim: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          make: string
          model: string
          year_start: number
          year_end: number
          engine?: string | null
          trim?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          make?: string
          model?: string
          year_start?: number
          year_end?: number
          engine?: string | null
          trim?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal: number
          tax: number
          shipping: number
          total: number
          shipping_address_id: string
          billing_address_id: string
          payment_method: string
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_intent_id: string | null
          tracking_number: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal: number
          tax?: number
          shipping?: number
          total: number
          shipping_address_id: string
          billing_address_id: string
          payment_method: string
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_intent_id?: string | null
          tracking_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal?: number
          tax?: number
          shipping?: number
          total?: number
          shipping_address_id?: string
          billing_address_id?: string
          payment_method?: string
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_intent_id?: string | null
          tracking_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
          updated_at?: string
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
      user_role: 'customer' | 'admin'
      address_type: 'billing' | 'shipping'
      product_condition: 'new' | 'used' | 'refurbished'
      order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}