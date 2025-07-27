import { supabase } from '@/lib/supabase'
import { 
  Order, 
  OrderItem, 
  CreateOrderData, 
  OrderFilters, 
  DatabaseResponse,
  PaginatedResponse 
} from '@/types'
import { EmailService } from './email'

export class OrderService {
  /**
   * Create a new order with items
   */
  static async createOrder(orderData: CreateOrderData): Promise<DatabaseResponse<Order>> {
    try {
      // Generate order number
      const orderNumber = this.generateOrderNumber()
      
      // Calculate totals
      const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const tax = subtotal * 0.08 // 8% tax rate
      const shipping = subtotal > 100 ? 0 : 15 // Free shipping over $100
      const total = subtotal + tax + shipping
      
      // Create addresses first
      const shippingAddressResult = await this.createAddress(orderData.shipping_address, 'shipping')
      if (!shippingAddressResult.data) {
        return { data: null, error: shippingAddressResult.error }
      }
      
      let billingAddressId = shippingAddressResult.data.id
      if (orderData.billing_address) {
        const billingAddressResult = await this.createAddress(orderData.billing_address, 'billing')
        if (!billingAddressResult.data) {
          return { data: null, error: billingAddressResult.error }
        }
        billingAddressId = billingAddressResult.data.id
      }
      
      // Get current user (in a real app, this would come from auth context)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          status: 'pending',
          subtotal,
          tax,
          shipping,
          total,
          shipping_address_id: shippingAddressResult.data.id,
          billing_address_id: billingAddressId,
          payment_method: JSON.stringify(orderData.payment_method),
          payment_status: 'pending',
          payment_intent_id: orderData.payment_method.payment_session_id,
          notes: orderData.notes
        })
        .select()
        .single()
      
      if (orderError) {
        return { data: null, error: orderError }
      }
      
      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }))
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
      
      if (itemsError) {
        // Rollback order creation
        await supabase.from('orders').delete().eq('id', order.id)
        return { data: null, error: itemsError }
      }
      
      // Update product quantities
      for (const item of orderData.items) {
        await this.updateProductQuantity(item.product_id, -item.quantity)
      }
      
      // Clear user's cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
      
      return { data: order, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
  
  /**
   * Get orders with filtering and pagination
   */
  static async getOrders(filters: OrderFilters = {}): Promise<DatabaseResponse<PaginatedResponse<Order>>> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        user_id, 
        start_date, 
        end_date 
      } = filters
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          user:users(*),
          shipping_address:addresses!shipping_address_id(*),
          billing_address:addresses!billing_address_id(*),
          items:order_items(
            *,
            product:products(*)
          )
        `, { count: 'exact' })
      
      // Apply filters
      if (status) {
        query = query.eq('status', status)
      }
      
      if (user_id) {
        query = query.eq('user_id', user_id)
      }
      
      if (start_date) {
        query = query.gte('created_at', start_date)
      }
      
      if (end_date) {
        query = query.lte('created_at', end_date)
      }
      
      // Apply pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)
      
      // Order by creation date
      query = query.order('created_at', { ascending: false })
      
      const { data: orders, error, count } = await query
      
      if (error) {
        return { data: null, error }
      }
      
      return {
        data: {
          data: orders || [],
          total: count || 0,
          page,
          limit
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }
  
  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string): Promise<DatabaseResponse<Order>> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:users(*),
          shipping_address:addresses!shipping_address_id(*),
          billing_address:addresses!billing_address_id(*),
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', orderId)
        .single()
      
      if (error) {
        return { data: null, error }
      }
      
      return { data: order, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
  
  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<DatabaseResponse<Order>> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single()
      
      if (error) {
        return { data: null, error }
      }
      
      return { data: order, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
  
  /**
   * Cancel order
   */
  static async cancelOrder(orderId: string): Promise<DatabaseResponse<Order>> {
    try {
      // Get order items to restore inventory
      const orderResult = await this.getOrderById(orderId)
      if (!orderResult.data) {
        return { data: null, error: 'Order not found' }
      }
      
      const order = orderResult.data
      
      // Only allow cancellation of pending/confirmed orders
      if (!['pending', 'confirmed'].includes(order.status)) {
        return { data: null, error: 'Order cannot be cancelled' }
      }
      
      // Update order status
      const { data: updatedOrder, error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single()
      
      if (error) {
        return { data: null, error }
      }
      
      // Restore product quantities
      if (order.items) {
        for (const item of order.items) {
          await this.updateProductQuantity(item.product_id, item.quantity)
        }
      }
      
      return { data: updatedOrder, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
  
  /**
   * Generate unique order number
   */
  private static generateOrderNumber(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `ORD-${timestamp.slice(-8)}-${random}`
  }
  
  /**
   * Create address record
   */
  private static async createAddress(addressData: any, type: 'shipping' | 'billing') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }
    
    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: user.id,
        type,
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        zip_code: addressData.postal_code,
        country: addressData.country,
        is_default: false
      })
      .select()
      .single()
    
    return { data, error }
  }
  
  /**
   * Update product quantity
   */
  private static async updateProductQuantity(productId: string, quantityChange: number) {
    const { data: product } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', productId)
      .single()
    
    if (product) {
      await supabase
        .from('products')
        .update({ 
          quantity: Math.max(0, product.quantity + quantityChange),
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
    }
  }
}
