import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we're in a server environment to avoid client-side errors
const isServer = typeof window === 'undefined'

if (!supabaseUrl || !supabaseAnonKey) {
  if (isServer && process.env.NODE_ENV !== 'production') {
    console.error('Missing Supabase environment variables. Please check your .env.local file.')
    console.log('Required variables:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL')
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.log('See .env.example for setup instructions.')
  }
  
  // Only warn in production builds, don't throw error to allow builds to complete
  if (process.env.NODE_ENV === 'production' && isServer) {
    console.warn('Warning: Missing Supabase environment variables in production build')
  }
}

export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key', 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Utility functions for common database operations
export const db = {
  // User operations
  users: {
    async getById(id: string) {
      return await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
    },
    
    async updateProfile(id: string, updates: Partial<Database['public']['Tables']['users']['Update']>) {
      return await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    }
  },

  // Product operations
  products: {
    async getAll(filters?: {
      make?: string
      model?: string
      year?: number
      category_id?: string
      condition?: string
      min_price?: number
      max_price?: number
      is_active?: boolean
      limit?: number
      offset?: number
    }) {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:product_categories(*),
          images:product_images(*),
          compatibility:vehicle_compatibility(*)
        `)
        .order('created_at', { ascending: false })

      if (filters) {
        if (filters.make) query = query.eq('make', filters.make)
        if (filters.model) query = query.eq('model', filters.model)
        if (filters.year) query = query.eq('year', filters.year)
        if (filters.category_id) query = query.eq('category_id', filters.category_id)
        if (filters.condition) query = query.eq('condition', filters.condition)
        if (filters.min_price) query = query.gte('price', filters.min_price)
        if (filters.max_price) query = query.lte('price', filters.max_price)
        if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active)
        if (filters.limit) query = query.limit(filters.limit)
        if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      return await query
    },

    async getById(id: string) {
      return await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(*),
          images:product_images(*),
          compatibility:vehicle_compatibility(*)
        `)
        .eq('id', id)
        .single()
    },

    async search(searchTerm: string, filters?: any) {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:product_categories(*),
          images:product_images(*),
          compatibility:vehicle_compatibility(*)
        `)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`)
        .eq('is_active', true)

      if (filters) {
        if (filters.make) query = query.eq('make', filters.make)
        if (filters.model) query = query.eq('model', filters.model)
        if (filters.year) query = query.eq('year', filters.year)
        if (filters.category_id) query = query.eq('category_id', filters.category_id)
        if (filters.condition) query = query.eq('condition', filters.condition)
        if (filters.min_price) query = query.gte('price', filters.min_price)
        if (filters.max_price) query = query.lte('price', filters.max_price)
      }

      return await query.order('created_at', { ascending: false })
    }
  },

  // Category operations
  categories: {
    async getAll() {
      return await supabase
        .from('product_categories')
        .select('*')
        .order('name')
    },

    async getWithProducts() {
      return await supabase
        .from('product_categories')
        .select(`
          *,
          products:products(count)
        `)
        .order('name')
    }
  },

  // Cart operations
  cart: {
    async getItems(userId: string) {
      return await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(
            *,
            images:product_images(*)
          )
        `)
        .eq('user_id', userId)
    },

    async addItem(userId: string, productId: string, quantity: number = 1) {
      return await supabase
        .from('cart_items')
        .upsert({
          user_id: userId,
          product_id: productId,
          quantity
        }, {
          onConflict: 'user_id,product_id'
        })
        .select()
    },

    async updateQuantity(userId: string, productId: string, quantity: number) {
      return await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', userId)
        .eq('product_id', productId)
        .select()
    },

    async removeItem(userId: string, productId: string) {
      return await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)
    },

    async clearCart(userId: string) {
      return await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
    }
  },

  // Order operations
  orders: {
    async create(orderData: Database['public']['Tables']['orders']['Insert']) {
      return await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()
    },

    async getByUser(userId: string) {
      return await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          ),
          shipping_address:addresses!orders_shipping_address_id_fkey(*),
          billing_address:addresses!orders_billing_address_id_fkey(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    },

    async getById(id: string) {
      return await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          ),
          shipping_address:addresses!orders_shipping_address_id_fkey(*),
          billing_address:addresses!orders_billing_address_id_fkey(*),
          user:users(*)
        `)
        .eq('id', id)
        .single()
    },

    async updateStatus(id: string, status: Database['public']['Enums']['order_status']) {
      return await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
    }
  },

  // Address operations
  addresses: {
    async getByUser(userId: string) {
      return await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
    },

    async create(addressData: Database['public']['Tables']['addresses']['Insert']) {
      return await supabase
        .from('addresses')
        .insert(addressData)
        .select()
        .single()
    },

    async update(id: string, updates: Database['public']['Tables']['addresses']['Update']) {
      return await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    },

    async delete(id: string) {
      return await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
    }
  }
}

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error)
  
  if (error?.code === 'PGRST116') {
    return { error: 'No data found' }
  }
  
  if (error?.code === '23505') {
    return { error: 'This item already exists' }
  }
  
  if (error?.code === '23503') {
    return { error: 'Referenced item does not exist' }
  }
  
  return { error: error?.message || 'An unexpected error occurred' }
}