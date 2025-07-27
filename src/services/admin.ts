import { supabase } from '@/lib/supabase'
import { Product } from '@/types'

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'super_admin'
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  product_id: string
  quantity: number
  reserved_quantity: number
  available_quantity: number
  minimum_stock: number
  maximum_stock: number
  reorder_point: number
  location: string
  last_updated: string
}

export interface AdminStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  pendingOrders: number
  lowStockProducts: number
  recentOrders: any[]
  topSellingProducts: any[]
  monthlyRevenue: number[]
  dailyOrders: number[]
}

export class AdminService {
  // Authentication & Authorization
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        return false
      }

      return ['admin', 'super_admin'].includes(data.role)
    } catch (error) {
      console.error('AdminService.isAdmin error:', error)
      return false
    }
  }

  static async getAdminUser(userId: string): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching admin user:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('AdminService.getAdminUser error:', error)
      return null
    }
  }

  // Dashboard Analytics
  static async getDashboardStats(): Promise<AdminStats> {
    try {
      // Get basic counts
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true })
      ])

      // Get revenue data
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('status', 'completed')

      const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

      // Get pending orders
      const { data: pendingOrdersData } = await supabase
        .from('orders')
        .select('id')
        .in('status', ['pending', 'processing'])

      // Get low stock products
      const { data: lowStockData } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .lt('stock_quantity', 10)

      // Get recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          *,
          users!inner(email, first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      // Get top selling products
      const { data: topProducts } = await supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          products!inner(name, price, images)
        `)
        .order('quantity', { ascending: false })
        .limit(10)

      // Calculate monthly revenue (last 12 months)
      const monthlyRevenue = this.calculateMonthlyRevenue(revenueData || [])
      
      // Calculate daily orders (last 30 days)
      const dailyOrders = this.calculateDailyOrders(recentOrders || [])

      return {
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalRevenue,
        pendingOrders: pendingOrdersData?.length || 0,
        lowStockProducts: lowStockData?.length || 0,
        recentOrders: recentOrders || [],
        topSellingProducts: topProducts || [],
        monthlyRevenue,
        dailyOrders
      }
    } catch (error) {
      console.error('AdminService.getDashboardStats error:', error)
      throw new Error('Dashboard istatistikleri alınamadı')
    }
  }

  private static calculateMonthlyRevenue(revenueData: any[]): number[] {
    const months = Array(12).fill(0)
    const currentDate = new Date()
    
    revenueData.forEach(order => {
      const orderDate = new Date(order.created_at)
      const monthDiff = (currentDate.getFullYear() - orderDate.getFullYear()) * 12 + 
                       (currentDate.getMonth() - orderDate.getMonth())
      
      if (monthDiff >= 0 && monthDiff < 12) {
        months[11 - monthDiff] += order.total_amount
      }
    })
    
    return months
  }

  private static calculateDailyOrders(ordersData: any[]): number[] {
    const days = Array(30).fill(0)
    const currentDate = new Date()
    
    ordersData.forEach(order => {
      const orderDate = new Date(order.created_at)
      const dayDiff = Math.floor((currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (dayDiff >= 0 && dayDiff < 30) {
        days[29 - dayDiff]++
      }
    })
    
    return days
  }

  // Inventory Management
  static async getInventoryItems(limit = 50, offset = 0): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products!inner(name, sku, price, images)
        `)
        .order('last_updated', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching inventory:', error)
        throw new Error('Envanter listesi alınamadı')
      }

      return data || []
    } catch (error) {
      console.error('AdminService.getInventoryItems error:', error)
      throw error
    }
  }

  static async updateInventory(productId: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update({
          ...updates,
          last_updated: new Date().toISOString()
        })
        .eq('product_id', productId)
        .select()
        .single()

      if (error) {
        console.error('Error updating inventory:', error)
        throw new Error('Envanter güncellenemedi')
      }

      return data
    } catch (error) {
      console.error('AdminService.updateInventory error:', error)
      throw error
    }
  }

  static async getLowStockProducts(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          inventory!inner(quantity, minimum_stock, reorder_point)
        `)
        .lt('stock_quantity', 10)
        .order('stock_quantity', { ascending: true })

      if (error) {
        console.error('Error fetching low stock products:', error)
        throw new Error('Düşük stoklu ürünler alınamadı')
      }

      return data || []
    } catch (error) {
      console.error('AdminService.getLowStockProducts error:', error)
      throw error
    }
  }

  // Order Management
  static async getOrders(
    filters: {
      status?: string
      dateFrom?: string
      dateTo?: string
      userId?: string
    } = {},
    limit = 50,
    offset = 0
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          users!inner(email, first_name, last_name),
          order_items(
            *,
            products!inner(name, images, sku)
          )
        `)

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching orders:', error)
        throw new Error('Siparişler alınamadı')
      }

      return data || []
    } catch (error) {
      console.error('AdminService.getOrders error:', error)
      throw error
    }
  }

  static async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status,
          admin_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error) {
        console.error('Error updating order status:', error)
        throw new Error('Sipariş durumu güncellenemedi')
      }

      return data
    } catch (error) {
      console.error('AdminService.updateOrderStatus error:', error)
      throw error
    }
  }

  // Product Management
  static async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating product:', error)
        throw new Error('Ürün oluşturulamadı')
      }

      // Create initial inventory record
      await supabase
        .from('inventory')
        .insert({
          product_id: data.id,
          quantity: productData.quantity || 0,
          reserved_quantity: 0,
          available_quantity: productData.quantity || 0,
          minimum_stock: 5,
          maximum_stock: 1000,
          reorder_point: 10,
          location: 'Ana Depo',
          last_updated: new Date().toISOString()
        })

      return data
    } catch (error) {
      console.error('AdminService.createProduct error:', error)
      throw error
    }
  }

  static async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single()

      if (error) {
        console.error('Error updating product:', error)
        throw new Error('Ürün güncellenemedi')
      }

      return data
    } catch (error) {
      console.error('AdminService.updateProduct error:', error)
      throw error
    }
  }

  static async deleteProduct(productId: string): Promise<void> {
    try {
      // Check if product has orders
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('id')
        .eq('product_id', productId)
        .limit(1)

      if (orderItems && orderItems.length > 0) {
        throw new Error('Bu ürün siparişlerde kullanıldığı için silinemez')
      }

      // Delete inventory record first
      await supabase
        .from('inventory')
        .delete()
        .eq('product_id', productId)

      // Delete product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('Error deleting product:', error)
        throw new Error('Ürün silinemedi')
      }
    } catch (error) {
      console.error('AdminService.deleteProduct error:', error)
      throw error
    }
  }

  // Bulk Operations
  static async bulkUpdateProducts(updates: { id: string; data: Partial<Product> }[]): Promise<void> {
    try {
      const promises = updates.map(update =>
        this.updateProduct(update.id, update.data)
      )

      await Promise.all(promises)
    } catch (error) {
      console.error('AdminService.bulkUpdateProducts error:', error)
      throw new Error('Toplu ürün güncellemesi başarısız')
    }
  }

  static async bulkUpdateInventory(updates: { product_id: string; data: Partial<InventoryItem> }[]): Promise<void> {
    try {
      const promises = updates.map(update =>
        this.updateInventory(update.product_id, update.data)
      )

      await Promise.all(promises)
    } catch (error) {
      console.error('AdminService.bulkUpdateInventory error:', error)
      throw new Error('Toplu envanter güncellemesi başarısız')
    }
  }

  // User Management
  static async getUsers(limit = 50, offset = 0): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          orders(id, total_amount, status)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching users:', error)
        throw new Error('Kullanıcılar alınamadı')
      }

      return data || []
    } catch (error) {
      console.error('AdminService.getUsers error:', error)
      throw error
    }
  }

  // Reports
  static async generateSalesReport(dateFrom: string, dateTo: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products!inner(name, category, brand)
          )
        `)
        .eq('status', 'completed')
        .gte('created_at', dateFrom)
        .lte('created_at', dateTo)

      if (error) {
        console.error('Error generating sales report:', error)
        throw new Error('Satış raporu oluşturulamadı')
      }

      // Process data for report
      const totalSales = data?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      const totalOrders = data?.length || 0
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

      const categoryStats = this.calculateCategoryStats(data || [])
      const brandStats = this.calculateBrandStats(data || [])

      return {
        totalSales,
        totalOrders,
        averageOrderValue,
        categoryStats,
        brandStats,
        orders: data || []
      }
    } catch (error) {
      console.error('AdminService.generateSalesReport error:', error)
      throw error
    }
  }

  private static calculateCategoryStats(orders: any[]): Record<string, number> {
    const stats: Record<string, number> = {}
    
    orders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const category = item.products?.category || 'Diğer'
        const revenue = item.quantity * item.price
        stats[category] = (stats[category] || 0) + revenue
      })
    })
    
    return stats
  }

  private static calculateBrandStats(orders: any[]): Record<string, number> {
    const stats: Record<string, number> = {}
    
    orders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const brand = item.products?.brand || 'Diğer'
        const revenue = item.quantity * item.price
        stats[brand] = (stats[brand] || 0) + revenue
      })
    })
    
    return stats
  }
}

export default AdminService
