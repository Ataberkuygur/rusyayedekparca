import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import {
  addToCart,
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartItemCount,
  getCartTotal,
  validateCartItem,
  validateCartItemOwnership
} from '../database'

// Mock the Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [],
          error: null
        })),
        single: jest.fn(() => ({
          data: null,
          error: null
        }))
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => ({
          data: {
            id: 'cart-item-1',
            user_id: 'user-1',
            product_id: 'product-1',
            quantity: 2,
            created_at: '2025-07-27T12:00:00Z',
            updated_at: '2025-07-27T12:00:00Z'
          },
          error: null
        }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'cart-item-1',
              user_id: 'user-1',
              product_id: 'product-1',
              quantity: 3,
              created_at: '2025-07-27T12:00:00Z',
              updated_at: '2025-07-27T12:00:00Z'
            },
            error: null
          }))
        }))
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({
        error: null
      }))
    }))
  }))
}

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

describe('Database Cart Functions', () => {
  const mockUserId = 'user-123'
  const mockProductId = 'product-456'
  const mockCartItemId = 'cart-item-789'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('addToCart', () => {
    it('should add new item to cart', async () => {
      const mockCartItem = {
        id: mockCartItemId,
        user_id: mockUserId,
        product_id: mockProductId,
        quantity: 2,
        created_at: '2025-07-27T12:00:00Z',
        updated_at: '2025-07-27T12:00:00Z'
      }

      // Mock no existing item
      mockSupabase.from().select().eq().eq().single.mockReturnValueOnce({
        data: null,
        error: { message: 'No rows found' }
      })

      // Mock successful insert
      mockSupabase.from().insert().select().single.mockReturnValueOnce({
        data: mockCartItem,
        error: null
      })

      const result = await addToCart(mockUserId, mockProductId, 2)

      expect(result).toEqual(mockCartItem)
    })

    it('should update existing item quantity', async () => {
      const existingItem = {
        id: mockCartItemId,
        user_id: mockUserId,
        product_id: mockProductId,
        quantity: 1,
        created_at: '2025-07-27T12:00:00Z',
        updated_at: '2025-07-27T12:00:00Z'
      }

      const updatedItem = { ...existingItem, quantity: 3 }

      // Mock existing item found
      mockSupabase.from().select().eq().eq().single.mockReturnValueOnce({
        data: existingItem,
        error: null
      })

      // Mock successful update
      mockSupabase.from().update().eq().select().single.mockReturnValueOnce({
        data: updatedItem,
        error: null
      })

      const result = await addToCart(mockUserId, mockProductId, 2)

      expect(result).toEqual(updatedItem)
    })
  })

  describe('getCartItems', () => {
    it('should get cart items with product details', async () => {
      const mockCartItems = [
        {
          id: mockCartItemId,
          user_id: mockUserId,
          product_id: mockProductId,
          quantity: 2,
          created_at: '2025-07-27T12:00:00Z',
          updated_at: '2025-07-27T12:00:00Z',
          product: {
            id: mockProductId,
            name: 'Test Product',
            price: 29.99
          }
        }
      ]

      mockSupabase.from().select().eq().order.mockReturnValueOnce({
        data: mockCartItems,
        error: null
      })

      const result = await getCartItems(mockUserId)

      expect(result).toEqual(mockCartItems)
    })
  })

  describe('updateCartItemQuantity', () => {
    it('should update cart item quantity', async () => {
      const mockUpdatedItem = {
        id: mockCartItemId,
        user_id: mockUserId,
        product_id: mockProductId,
        quantity: 5,
        created_at: '2025-07-27T12:00:00Z',
        updated_at: '2025-07-27T12:00:00Z'
      }

      mockSupabase.from().update().eq().select().single.mockReturnValueOnce({
        data: mockUpdatedItem,
        error: null
      })

      const result = await updateCartItemQuantity(mockCartItemId, 5)

      expect(result).toEqual(mockUpdatedItem)
    })

    it('should throw error for invalid quantity', async () => {
      await expect(
        updateCartItemQuantity(mockCartItemId, 0)
      ).rejects.toThrow('Quantity must be greater than 0')
    })
  })

  describe('removeFromCart', () => {
    it('should remove cart item', async () => {
      mockSupabase.from().delete().eq.mockReturnValueOnce({
        error: null
      })

      await expect(removeFromCart(mockCartItemId)).resolves.toBeUndefined()
    })
  })

  describe('clearCart', () => {
    it('should clear all cart items for user', async () => {
      mockSupabase.from().delete().eq.mockReturnValueOnce({
        error: null
      })

      await expect(clearCart(mockUserId)).resolves.toBeUndefined()
    })
  })

  describe('getCartItemCount', () => {
    it('should return total item count', async () => {
      const mockData = [
        { quantity: 2 },
        { quantity: 3 },
        { quantity: 1 }
      ]

      mockSupabase.from().select().eq.mockReturnValueOnce({
        data: mockData,
        error: null
      })

      const result = await getCartItemCount(mockUserId)

      expect(result).toBe(6)
    })

    it('should return 0 for empty cart', async () => {
      mockSupabase.from().select().eq.mockReturnValueOnce({
        data: [],
        error: null
      })

      const result = await getCartItemCount(mockUserId)

      expect(result).toBe(0)
    })
  })

  describe('getCartTotal', () => {
    it('should calculate cart total', async () => {
      const mockData = [
        { quantity: 2, product: { price: 29.99 } },
        { quantity: 1, product: { price: 19.99 } }
      ]

      mockSupabase.from().select().eq.mockReturnValueOnce({
        data: mockData,
        error: null
      })

      const result = await getCartTotal(mockUserId)

      expect(result).toBe(79.97)
    })
  })

  describe('validateCartItem', () => {
    it('should return valid for available product', async () => {
      const mockProduct = {
        id: mockProductId,
        quantity: 10,
        is_active: true
      }

      mockSupabase.from().select().eq().eq().single.mockReturnValueOnce({
        data: mockProduct,
        error: null
      })

      const result = await validateCartItem(mockProductId, 2)

      expect(result).toEqual({ valid: true })
    })

    it('should return invalid for insufficient stock', async () => {
      const mockProduct = {
        id: mockProductId,
        quantity: 1,
        is_active: true
      }

      mockSupabase.from().select().eq().eq().single.mockReturnValueOnce({
        data: mockProduct,
        error: null
      })

      const result = await validateCartItem(mockProductId, 5)

      expect(result).toEqual({
        valid: false,
        message: 'Only 1 items available in stock'
      })
    })
  })

  describe('validateCartItemOwnership', () => {
    it('should return true for valid ownership', async () => {
      mockSupabase.from().select().eq().single.mockReturnValueOnce({
        data: { user_id: mockUserId },
        error: null
      })

      const result = await validateCartItemOwnership(mockCartItemId, mockUserId)

      expect(result).toBe(true)
    })

    it('should return false for invalid ownership', async () => {
      mockSupabase.from().select().eq().single.mockReturnValueOnce({
        data: { user_id: 'other-user' },
        error: null
      })

      const result = await validateCartItemOwnership(mockCartItemId, mockUserId)

      expect(result).toBe(false)
    })
  })
})
