// Database service tests
// These tests verify the database service layer functionality

import { DatabaseService } from '../database'
import { supabase } from '../../lib/supabase'

// Mock Supabase for testing
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn()
  },
  db: {
    products: {
      getById: jest.fn(),
      search: jest.fn()
    },
    categories: {
      getAll: jest.fn(),
      getWithProducts: jest.fn()
    },
    users: {
      getById: jest.fn(),
      updateProfile: jest.fn()
    },
    cart: {
      getItems: jest.fn(),
      addItem: jest.fn(),
      updateQuantity: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn()
    },
    orders: {
      getById: jest.fn(),
      getByUser: jest.fn(),
      updateStatus: jest.fn()
    },
    addresses: {
      getByUser: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  },
  handleSupabaseError: jest.fn()
}))

describe('DatabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Product Operations', () => {
    it('should fetch products with pagination', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          price: 29.99,
          is_active: true
        }
      ]

      const mockSupabaseChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockProducts,
          error: null,
          count: 1
        })
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain)

      const result = await DatabaseService.getProducts({ page: 1, limit: 20 })

      expect(result.data).toEqual(mockProducts)
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })

    it('should handle product fetch errors gracefully', async () => {
      const mockSupabaseChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
          count: 0
        })
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain)

      const result = await DatabaseService.getProducts()

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('Order Number Generation', () => {
    it('should generate unique order numbers', async () => {
      const orderNumber1 = await DatabaseService.generateOrderNumber()
      const orderNumber2 = await DatabaseService.generateOrderNumber()

      expect(orderNumber1).toMatch(/^ORD-[A-Z0-9]+-[A-Z0-9]+$/)
      expect(orderNumber2).toMatch(/^ORD-[A-Z0-9]+-[A-Z0-9]+$/)
      expect(orderNumber1).not.toBe(orderNumber2)
    })
  })

  describe('Product Availability', () => {
    it('should check product availability correctly', async () => {
      const mockSupabaseChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            quantity: 10,
            is_active: true
          },
          error: null
        })
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain)

      const isAvailable = await DatabaseService.checkProductAvailability('product-id', 5)
      expect(isAvailable).toBe(true)

      const isNotAvailable = await DatabaseService.checkProductAvailability('product-id', 15)
      expect(isNotAvailable).toBe(false)
    })

    it('should return false for inactive products', async () => {
      const mockSupabaseChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            quantity: 10,
            is_active: false
          },
          error: null
        })
      }

      ;(supabase.from as jest.Mock).mockReturnValue(mockSupabaseChain)

      const isAvailable = await DatabaseService.checkProductAvailability('product-id', 5)
      expect(isAvailable).toBe(false)
    })
  })
})

// Integration test helpers (to be run against actual Supabase instance)
export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Database connection test failed:', error)
      return false
    }

    console.log('Database connection test passed')
    return true
  } catch (error) {
    console.error('Database connection test error:', error)
    return false
  }
}

export const testSampleDataExists = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Sample data test failed:', error)
      return false
    }

    const hasData = data && data.length > 0
    console.log(`Sample data test: ${hasData ? 'PASSED' : 'FAILED'}`)
    return hasData
  } catch (error) {
    console.error('Sample data test error:', error)
    return false
  }
}