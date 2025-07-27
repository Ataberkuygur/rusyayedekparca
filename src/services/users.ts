import { supabase } from '@/lib/supabase'
import { User } from '@/types'

export interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  date_of_birth?: string
  created_at: string
  updated_at: string
}

export interface UserAddress {
  id: string
  user_id: string
  title: string
  first_name: string
  last_name: string
  phone: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  newsletter_subscribed: boolean
  sms_notifications: boolean
  email_notifications: boolean
  preferred_language: 'tr' | 'en'
  preferred_currency: 'TRY' | 'USD' | 'EUR'
  created_at: string
  updated_at: string
}

export class UserService {
  // Profile Management
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        throw new Error('Kullanıcı profili alınamadı')
      }

      return data
    } catch (error) {
      console.error('UserService.getUserProfile error:', error)
      throw error
    }
  }

  static async updateUserProfile(
    userId: string, 
    updates: Partial<Omit<UserProfile, 'id' | 'email' | 'created_at' | 'updated_at'>>
  ): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        throw new Error('Profil güncellenemedi')
      }

      return data
    } catch (error) {
      console.error('UserService.updateUserProfile error:', error)
      throw error
    }
  }

  // Address Management
  static async getUserAddresses(userId: string): Promise<UserAddress[]> {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user addresses:', error)
        throw new Error('Adresler alınamadı')
      }

      return data || []
    } catch (error) {
      console.error('UserService.getUserAddresses error:', error)
      throw error
    }
  }

  static async createUserAddress(userId: string, address: Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<UserAddress> {
    try {
      // If this is the default address, remove default from others
      if (address.is_default) {
        await this.removeDefaultFromAllAddresses(userId)
      }

      const { data, error } = await supabase
        .from('user_addresses')
        .insert({
          ...address,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user address:', error)
        throw new Error('Adres eklenemedi')
      }

      return data
    } catch (error) {
      console.error('UserService.createUserAddress error:', error)
      throw error
    }
  }

  static async updateUserAddress(
    addressId: string, 
    userId: string,
    updates: Partial<Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<UserAddress> {
    try {
      // If this is being set as default, remove default from others
      if (updates.is_default) {
        await this.removeDefaultFromAllAddresses(userId)
      }

      const { data, error } = await supabase
        .from('user_addresses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user address:', error)
        throw new Error('Adres güncellenemedi')
      }

      return data
    } catch (error) {
      console.error('UserService.updateUserAddress error:', error)
      throw error
    }
  }

  static async deleteUserAddress(addressId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting user address:', error)
        throw new Error('Adres silinemedi')
      }
    } catch (error) {
      console.error('UserService.deleteUserAddress error:', error)
      throw error
    }
  }

  static async setDefaultAddress(addressId: string, userId: string): Promise<void> {
    try {
      // Remove default from all addresses
      await this.removeDefaultFromAllAddresses(userId)

      // Set this address as default
      const { error } = await supabase
        .from('user_addresses')
        .update({ 
          is_default: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', addressId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error setting default address:', error)
        throw new Error('Varsayılan adres ayarlanamadı')
      }
    } catch (error) {
      console.error('UserService.setDefaultAddress error:', error)
      throw error
    }
  }

  private static async removeDefaultFromAllAddresses(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_addresses')
      .update({ 
        is_default: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_default', true)

    if (error) {
      console.error('Error removing default from addresses:', error)
      throw new Error('Varsayılan adres temizlenemedi')
    }
  }

  // User Preferences Management
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user preferences:', error)
        throw new Error('Kullanıcı tercihleri alınamadı')
      }

      return data
    } catch (error) {
      console.error('UserService.getUserPreferences error:', error)
      throw error
    }
  }

  static async createOrUpdateUserPreferences(
    userId: string, 
    preferences: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<UserPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error updating user preferences:', error)
        throw new Error('Kullanıcı tercihleri güncellenemedi')
      }

      return data
    } catch (error) {
      console.error('UserService.createOrUpdateUserPreferences error:', error)
      throw error
    }
  }

  // Order History
  static async getUserOrderHistory(userId: string, limit = 10, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              images,
              price
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching user order history:', error)
        throw new Error('Sipariş geçmişi alınamadı')
      }

      return data || []
    } catch (error) {
      console.error('UserService.getUserOrderHistory error:', error)
      throw error
    }
  }

  static async getUserOrderStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching user order stats:', error)
        throw new Error('Sipariş istatistikleri alınamadı')
      }

      const orders = data || []
      const totalOrders = orders.length
      const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0)
      const completedOrders = orders.filter(order => order.status === 'completed').length
      const pendingOrders = orders.filter(order => ['pending', 'processing'].includes(order.status)).length

      return {
        totalOrders,
        totalSpent,
        completedOrders,
        pendingOrders,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
      }
    } catch (error) {
      console.error('UserService.getUserOrderStats error:', error)
      throw error
    }
  }

  // Reorder functionality
  static async reorderFromPreviousOrder(userId: string, orderId: string) {
    try {
      // Get the original order with items
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_id,
            quantity,
            price
          )
        `)
        .eq('id', orderId)
        .eq('user_id', userId)
        .single()

      if (orderError) {
        console.error('Error fetching order for reorder:', orderError)
        throw new Error('Sipariş bulunamadı')
      }

      if (!order) {
        throw new Error('Sipariş bulunamadı')
      }

      // Add items to cart
      const cartItems = order.order_items?.map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity
      })) || []

      return cartItems
    } catch (error) {
      console.error('UserService.reorderFromPreviousOrder error:', error)
      throw error
    }
  }
}

export default UserService
