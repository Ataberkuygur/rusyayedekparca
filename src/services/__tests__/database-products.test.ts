import { DatabaseService } from '../database'
import { supabase, handleSupabaseError } from '../../lib/supabase'
import { CreateProductData, UpdateProductData, ProductFilters } from '../../types'

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn()
  },
  db: {
    products: {
      getById: jest.fn(),
      search: jest.fn()
    }
  },
  handleSupabaseError: jest.fn((error) => ({ data: null, error: error.message || 'Database error' }))
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('DatabaseService - Product Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getProducts', () => {
    it('should fetch products with pagination', async () => {
      const mockProducts = [
        {
          id: '1',
          sku: 'TEST-001',
          name: 'Test Product',
          description: 'Test Description',
          category_id: 'cat-1',
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          condition: 'used',
          price: 99.99,
          quantity: 5,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockProducts,
          error: null,
          count: 1
        })
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await DatabaseService.getProducts({ page: 1, limit: 20 })

      expect(mockSupabase.from).toHaveBeenCalledWith('products')
      expect(mockQuery.select).toHaveBeenCalledWith(
        expect.stringContaining('category:product_categories(*)')
      )
      expect(mockQuery.eq).toHaveBeenCalledWith('is_active', true)
      expect(mockQuery.range).toHaveBeenCalledWith(0, 19)
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })

      expect(result).toEqual({
        data: mockProducts,
        total: 1,
        page: 1,
        limit: 20
      })
    })

    it('should handle database errors gracefully', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
          count: 0
        })
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await DatabaseService.getProducts()

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 20
      })
    })
  })

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      const productData: CreateProductData = {
        sku: 'NEW-001',
        name: 'New Product',
        description: 'New Description',
        category_id: 'cat-1',
        make: 'Honda',
        model: 'Civic',
        year: 2021,
        condition: 'new',
        price: 149.99,
        quantity: 10
      }

      const mockProduct = {
        id: '2',
        ...productData,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProduct,
          error: null
        })
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await DatabaseService.createProduct(productData)

      expect(mockSupabase.from).toHaveBeenCalledWith('products')
      expect(mockQuery.insert).toHaveBeenCalledWith({
        ...productData,
        dimensions: null,
        specifications: null
      })
      expect(result).toEqual({ data: mockProduct, error: null })
    })

    it('should handle JSON serialization for dimensions and specifications', async () => {
      const productData: CreateProductData = {
        sku: 'NEW-002',
        name: 'Product with Specs',
        description: 'Description',
        category_id: 'cat-1',
        make: 'Ford',
        model: 'F-150',
        year: 2022,
        condition: 'new',
        price: 299.99,
        quantity: 3,
        dimensions: { length: 10, width: 5, height: 3, unit: 'in' },
        specifications: { material: 'steel', weight: '2.5 lbs' }
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: '3', ...productData },
          error: null
        })
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      await DatabaseService.createProduct(productData)

      expect(mockQuery.insert).toHaveBeenCalledWith({
        ...productData,
        dimensions: JSON.stringify(productData.dimensions),
        specifications: JSON.stringify(productData.specifications)
      })
    })

    it('should handle creation errors', async () => {
      const productData: CreateProductData = {
        sku: 'INVALID',
        name: '',
        description: '',
        category_id: 'invalid',
        make: '',
        model: '',
        year: 2021,
        condition: 'new',
        price: -1,
        quantity: -1
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Validation error')
        })
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await DatabaseService.createProduct(productData)

      expect(result.data).toBeNull()
      expect(result.error).toBeDefined()
    })
  })

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const productId = '1'
      const updates: UpdateProductData = {
        id: productId,
        price: 199.99,
        quantity: 15,
        specifications: { updated: true }
      }

      const mockUpdatedProduct = {
        id: productId,
        price: 199.99,
        quantity: 15,
        updated_at: '2024-01-02T00:00:00Z'
      }

      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUpdatedProduct,
          error: null
        })
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await DatabaseService.updateProduct(productId, updates)

      expect(mockSupabase.from).toHaveBeenCalledWith('products')
      expect(mockQuery.update).toHaveBeenCalledWith({
        ...updates,
        specifications: JSON.stringify(updates.specifications)
      })
      expect(mockQuery.eq).toHaveBeenCalledWith('id', productId)
      expect(result).toEqual({ data: mockUpdatedProduct, error: null })
    })

    it('should handle update errors', async () => {
      const productId = 'nonexistent'
      const updates: UpdateProductData = { id: productId, price: 199.99 }

      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Product not found')
        })
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await DatabaseService.updateProduct(productId, updates)

      expect(result.data).toBeNull()
      expect(result.error).toBeDefined()
    })
  })

  describe('checkProductAvailability', () => {
    it('should return true for available product', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { quantity: 10, is_active: true },
          error: null
        })
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await DatabaseService.checkProductAvailability('1', 5)

      expect(result).toBe(true)
      expect(mockQuery.select).toHaveBeenCalledWith('quantity, is_active')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
    })

    it('should return false for insufficient quantity', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { quantity: 2, is_active: true },
          error: null
        })
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await DatabaseService.checkProductAvailability('1', 5)

      expect(result).toBe(false)
    })

    it('should return false for inactive product', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { quantity: 10, is_active: false },
          error: null
        })
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await DatabaseService.checkProductAvailability('1', 5)

      expect(result).toBe(false)
    })

    it('should return false on database error', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error')
        })
      }

      mockSupabase.from.mockReturnValue(mockQuery as any)

      const result = await DatabaseService.checkProductAvailability('1', 5)

      expect(result).toBe(false)
    })
  })

  describe('updateProductQuantity', () => {
    it('should update product quantity using RPC', async () => {
      const productId = '1'
      const quantityChange = -2

      const mockUpdatedProduct = {
        id: productId,
        quantity: 8
      }

      mockSupabase.rpc.mockResolvedValue({
        data: mockUpdatedProduct,
        error: null
      })

      const result = await DatabaseService.updateProductQuantity(productId, quantityChange)

      expect(mockSupabase.rpc).toHaveBeenCalledWith('update_product_quantity', {
        product_id: productId,
        quantity_change: quantityChange
      })
      expect(result).toEqual({ data: mockUpdatedProduct, error: null })
    })

    it('should handle RPC errors', async () => {
      const productId = '1'
      const quantityChange = -2

      const mockError = new Error('RPC error')
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: mockError
      })

      const mockHandleSupabaseError = handleSupabaseError as jest.MockedFunction<typeof handleSupabaseError>
      mockHandleSupabaseError.mockReturnValue({ data: null, error: 'RPC error' })

      const result = await DatabaseService.updateProductQuantity(productId, quantityChange)

      expect(result.data).toBeNull()
      expect(result.error).toBe('RPC error')
    })
  })

  describe('generateOrderNumber', () => {
    it('should generate unique order number', async () => {
      const orderNumber = await DatabaseService.generateOrderNumber()

      expect(orderNumber).toMatch(/^ORD-[A-Z0-9]+-[A-Z0-9]+$/)
      expect(orderNumber.length).toBeGreaterThan(10)
    })

    it('should generate different order numbers on subsequent calls', async () => {
      const orderNumber1 = await DatabaseService.generateOrderNumber()
      const orderNumber2 = await DatabaseService.generateOrderNumber()

      expect(orderNumber1).not.toBe(orderNumber2)
    })
  })
})