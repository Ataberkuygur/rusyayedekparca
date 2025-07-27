import { describe, expect, test, jest, beforeEach } from '@jest/globals'
import CartService from '../cart'

// Mock fetch globally
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('CartService', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('getCart', () => {
    test('should fetch cart successfully', async () => {
      const mockCart = {
        items: [],
        subtotal: 0,
        itemCount: 0,
        total: 0
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCart,
      } as Response)

      const result = await CartService.getCart()

      expect(mockFetch).toHaveBeenCalledWith('/api/cart', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      expect(result).toEqual(mockCart)
    })

    test('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      } as Response)

      await expect(CartService.getCart()).rejects.toThrow('Unauthorized')
    })
  })

  describe('addToCart', () => {
    test('should add item to cart successfully', async () => {
      const mockRequest = { product_id: 'product-1', quantity: 2 }
      const mockResponse = {
        message: 'Item added to cart successfully',
        item: {
          id: 'cart-item-1',
          user_id: 'user-1',
          product_id: 'product-1',
          quantity: 2,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await CartService.addToCart(mockRequest)

      expect(mockFetch).toHaveBeenCalledWith('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockRequest),
      })
      expect(result).toEqual(mockResponse)
    })

    test('should throw error for invalid request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Product ID is required' }),
      } as Response)

      await expect(
        CartService.addToCart({ product_id: '', quantity: 1 })
      ).rejects.toThrow('Product ID is required')
    })
  })

  describe('updateCartItem', () => {
    test('should update cart item successfully', async () => {
      const mockResponse = {
        message: 'Cart item updated successfully',
        item: {
          id: 'cart-item-1',
          user_id: 'user-1',
          product_id: 'product-1',
          quantity: 3,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T01:00:00Z'
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await CartService.updateCartItem('cart-item-1', { quantity: 3 })

      expect(mockFetch).toHaveBeenCalledWith('/api/cart/cart-item-1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: 3 }),
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('removeFromCart', () => {
    test('should remove item from cart successfully', async () => {
      const mockResponse = { message: 'Item removed from cart successfully' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await CartService.removeFromCart('cart-item-1')

      expect(mockFetch).toHaveBeenCalledWith('/api/cart/cart-item-1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('clearCart', () => {
    test('should clear cart successfully', async () => {
      const mockResponse = { message: 'Cart cleared successfully' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await CartService.clearCart()

      expect(mockFetch).toHaveBeenCalledWith('/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getCartCount', () => {
    test('should return cart count', async () => {
      const mockCart = {
        items: [
          { id: '1', quantity: 2 },
          { id: '2', quantity: 1 }
        ],
        subtotal: 100,
        itemCount: 3,
        total: 100
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCart,
      } as Response)

      const result = await CartService.getCartCount()

      expect(result).toBe(3)
    })

    test('should return 0 when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await CartService.getCartCount()

      expect(result).toBe(0)
    })
  })

  describe('isInCart', () => {
    test('should return true when product is in cart', async () => {
      const mockCart = {
        items: [
          { id: '1', product_id: 'product-1', quantity: 1 },
          { id: '2', product_id: 'product-2', quantity: 2 }
        ],
        subtotal: 100,
        itemCount: 3,
        total: 100
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCart,
      } as Response)

      const result = await CartService.isInCart('product-1')

      expect(result).toBe(true)
    })

    test('should return false when product is not in cart', async () => {
      const mockCart = {
        items: [
          { id: '1', product_id: 'product-1', quantity: 1 }
        ],
        subtotal: 50,
        itemCount: 1,
        total: 50
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCart,
      } as Response)

      const result = await CartService.isInCart('product-3')

      expect(result).toBe(false)
    })
  })

  describe('validateCart', () => {
    test('should return valid cart', async () => {
      const mockCart = {
        items: [
          {
            id: '1',
            product_id: 'product-1',
            quantity: 1,
            product: {
              id: 'product-1',
              name: 'Test Product',
              is_active: true,
              quantity: 5
            }
          }
        ],
        subtotal: 50,
        itemCount: 1,
        total: 50
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCart,
      } as Response)

      const result = await CartService.validateCart()

      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    test('should return invalid cart with issues', async () => {
      const mockCart = {
        items: [
          {
            id: '1',
            product_id: 'product-1',
            quantity: 5,
            product: {
              id: 'product-1',
              name: 'Test Product',
              is_active: true,
              quantity: 2
            }
          },
          {
            id: '2',
            product_id: 'product-2',
            quantity: 1,
            product: {
              id: 'product-2',
              name: 'Inactive Product',
              is_active: false,
              quantity: 10
            }
          }
        ],
        subtotal: 100,
        itemCount: 6,
        total: 100
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCart,
      } as Response)

      const result = await CartService.validateCart()

      expect(result.valid).toBe(false)
      expect(result.issues).toHaveLength(2)
      expect(result.issues[0].issue).toBe('Insufficient inventory')
      expect(result.issues[1].issue).toBe('Product is no longer available')
    })
  })
})
