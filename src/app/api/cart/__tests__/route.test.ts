import { describe, expect, test, jest, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: [],
              error: null
            }))
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: null
            }))
          }))
        }))
      }))
    }))
  }
}))

const mockSupabase = require('@/lib/supabase').supabase

describe('/api/cart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/cart', () => {
    test('should return cart items for authenticated user', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      })

      // Mock cart items query
      const mockCartItems = [
        {
          id: 'cart-1',
          user_id: 'user-1',
          product_id: 'product-1',
          quantity: 2,
          product: {
            id: 'product-1',
            name: 'Test Product',
            price: 25.99,
            quantity: 10
          }
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockCartItems,
              error: null
            })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/cart')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toHaveLength(1)
      expect(data.subtotal).toBe(51.98) // 25.99 * 2
      expect(data.itemCount).toBe(2)
    })

    test('should return 401 for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })

      const request = new NextRequest('http://localhost:3000/api/cart')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    test('should handle database errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/cart')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch cart items')
    })
  })

  describe('POST /api/cart', () => {
    test('should add product to cart successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      })

      // Mock product exists and is available
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'products') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'product-1',
                    quantity: 10,
                    is_active: true
                  },
                  error: null
                })
              })
            })
          }
        }
        if (table === 'cart_items') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' } // No existing item
                  })
                })
              })
            }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'cart-1',
                    user_id: 'user-1',
                    product_id: 'product-1',
                    quantity: 1
                  },
                  error: null
                })
              })
            })
          }
        }
        return {}
      })

      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        body: JSON.stringify({
          product_id: 'product-1',
          quantity: 1
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Item added to cart successfully')
      expect(data.item.product_id).toBe('product-1')
    })

    test('should return 400 for missing product_id', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        body: JSON.stringify({
          quantity: 1
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Product ID and valid quantity are required')
    })

    test('should return 404 for non-existent product', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Product not found' }
            })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        body: JSON.stringify({
          product_id: 'non-existent',
          quantity: 1
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Product not found')
    })

    test('should return 400 for insufficient inventory', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'product-1',
                quantity: 2, // Only 2 in stock
                is_active: true
              },
              error: null
            })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/cart', {
        method: 'POST',
        body: JSON.stringify({
          product_id: 'product-1',
          quantity: 5 // Requesting more than available
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Only 2 items available in stock')
    })
  })
})
