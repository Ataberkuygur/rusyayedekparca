// Database service layer for car parts e-commerce
// Provides high-level database operations with error handling

import { supabase, db, handleSupabaseError } from '../lib/supabase'
import { 
  Product, 
  ProductFilters, 
  CreateProductData, 
  UpdateProductData,
  Order,
  OrderItem,
  CartItem,
  User,
  Address,
  ProductCategory,
  DatabaseResponse,
  PaginatedResponse
} from '../types'

export class DatabaseService {
  // Product operations
  static async getProducts(filters?: ProductFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Product>> {
    try {
      const page = filters?.page || 1
      const limit = filters?.limit || 20
      const offset = (page - 1) * limit

      const { data, error, count } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(*),
          images:product_images(*),
          compatibility:vehicle_compatibility(*)
        `, { count: 'exact' })
        .eq('is_active', true)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        data: data || [],
        total: count || 0,
        page,
        limit
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 20
      }
    }
  }

  static async getProductById(id: string): Promise<DatabaseResponse<Product>> {
    try {
      const result = await db.products.getById(id)
      return result
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  static async searchProducts(searchTerm: string, filters?: ProductFilters): Promise<DatabaseResponse<Product[]>> {
    try {
      const result = await db.products.search(searchTerm, filters)
      return result
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  static async createProduct(productData: CreateProductData): Promise<DatabaseResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          dimensions: productData.dimensions ? JSON.stringify(productData.dimensions) : null,
          specifications: productData.specifications ? JSON.stringify(productData.specifications) : null
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  static async updateProduct(id: string, updates: UpdateProductData): Promise<DatabaseResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          dimensions: updates.dimensions ? JSON.stringify(updates.dimensions) : undefined,
          specifications: updates.specifications ? JSON.stringify(updates.specifications) : undefined
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Category operations
  static async getCategories(): Promise<DatabaseResponse<ProductCategory[]>> {
    try {
      const result = await db.categories.getAll()
      return result
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  static async getCategoriesWithProductCount(): Promise<DatabaseResponse<ProductCategory[]>> {
    try {
      const result = await db.categories.getWithProducts()
      return result
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // User operations
  static async getUserById(id: string): Promise<DatabaseResponse<User>> {
    try {
      const result = await db.users.getById(id)
      return result
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  static async updateUserProfile(id: string, updates: Partial<User>): Promise<DatabaseResponse<User>> {
    try {
      const result = await db.users.updateProfile(id, updates)
      return result
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Cart operations
  static async getCartItems(userId: string): Promise<DatabaseResponse<CartItem[]>> {
    try {
      const result = await db.cart.getItems(userId)
      return result
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  static async addToCart(userId: string, productId: string, quantity: number = 1): Promise<DatabaseResponse<CartItem>> {
    try {
      const { data, error } = await db.cart.addItem(userId, productId, quantity)
      if (error) throw error
      return { data: data?.[0] || null, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  static async updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<DatabaseResponse<CartItem>> {
    try {
      const { data, error } = await db.cart.updateQuantity(userId, productId, quantity)
      if (error) throw error
      return { data: data?.[0] || null, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  static async removeFromCart(userId: string, productId: string): Promise<DatabaseResponse<boolean>> {
    try {
      const { error } = await db.cart.removeItem(userId, productId)
      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  static async clearCart(userId: string): Promise<DatabaseResponse<boolean>> {
    try {
      const { error } = await db.cart.clearCart(userId)
      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Order operations
  static async createOrder(orderData: {
    user_id: string
    order_number: string
    subtotal: number
    tax: number
    shipping: number
    total: number
    shipping_address_id: string
    billing_address_id: string
    payment_method: string
    items: Array<{
      product_id: string
      quantity: number
      unit_price: number
      total_price: number
    }>
  }): Promise<DatabaseResponse<Order>> {
    try {
      // Start a transaction
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.user_id,
          order_number: orderData.order_number,
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          shipping: orderData.shipping,
          total: orderData.total,
          shipping_address_id: orderData.shipping_address_id,
          billing_address_id: orderData.billing_address_id,
          payment_method: orderData.payment_method
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Insert order items
      const orderItems = orderData.items.map(item => ({
        ...item,
        order_id: order.id
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Get the complete order with items
      const result = await db.orders.getById(order.id)
      return result
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  static async getUserOrders(userId: string): Promise<DatabaseResponse<Order[]>> {
    try {
      const result = await db.orders.getByUser(userId)
      return result
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  static async getOrderById(id: string): Promise<DatabaseResponse<Order>> {
    try {
      const result = await db.orders.getById(id)
      return result
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  static async updateOrderStatus(id: string, status: Order['status']): Promise<DatabaseResponse<Order>> {
    try {
      const result = await db.orders.updateStatus(id, status)
      return result
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Address operations
  static async getUserAddresses(userId: string): Promise<DatabaseResponse<Address[]>> {
    try {
      const result = await db.addresses.getByUser(userId)
      return result
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  static async createAddress(addressData: Omit<Address, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResponse<Address>> {
    try {
      const result = await db.addresses.create(addressData)
      return result
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  static async updateAddress(id: string, updates: Partial<Address>): Promise<DatabaseResponse<Address>> {
    try {
      const result = await db.addresses.update(id, updates)
      return result
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  static async deleteAddress(id: string): Promise<DatabaseResponse<boolean>> {
    try {
      const { error } = await db.addresses.delete(id)
      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }

  // Utility functions
  static async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `ORD-${timestamp}-${random}`
  }

  static async checkProductAvailability(productId: string, quantity: number): Promise<boolean> {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('quantity, is_active')
        .eq('id', productId)
        .single()

      return product?.is_active && product?.quantity >= quantity
    } catch (error) {
      console.error('Error checking product availability:', error)
      return false
    }
  }

  static async updateProductQuantity(productId: string, quantityChange: number): Promise<DatabaseResponse<Product>> {
    try {
      const { data, error } = await supabase.rpc('update_product_quantity', {
        product_id: productId,
        quantity_change: quantityChange
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}