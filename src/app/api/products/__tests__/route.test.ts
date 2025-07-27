import { GET, POST } from '../route'
import { DatabaseService } from '../../../../services/database'
import { NextRequest } from 'next/server'

// Mock DatabaseService
jest.mock('../../../../services/database')
const mockDatabaseService = DatabaseService as jest.Mocked<typeof DatabaseService>

// Helper to create mock NextRequest
function createMockRequest(url: string, options: RequestInit = {}): NextRequest {
  return new NextRequest(url, options)
}

describe('/api/products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('should return products with default pagination', async () => {
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
          condition: 'used' as const,
          price: 99.99,
          quantity: 5,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockDatabaseService.getProducts.mockResolvedValue({
        data: mockProducts,
        total: 1,
        page: 1,
        limit: 20
      })

      const request = createMockRequest('http://localhost:3000/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockProducts)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1
      })
      expect(mockDatabaseService.getProducts).toHaveBeenCalledWith({
        page: 1,
        limit: 20
      })
    })

    it('should handle query parameters', async () => {
      mockDatabaseService.getProducts.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 10
      })

      const request = createMockRequest(
        'http://localhost:3000/api/products?make=Toyota&model=Camry&year=2020&page=2&limit=10'
      )
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockDatabaseService.getProducts).toHaveBeenCalledWith({
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        page: 2,
        limit: 10
      })
    })

    it('should handle invalid query parameters', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/products?year=invalid&page=0'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid parameters')
      expect(data.details).toBeDefined()
    })

    it('should handle database service errors', async () => {
      mockDatabaseService.getProducts.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest('http://localhost:3000/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to fetch products')
    })
  })

  describe('POST /api/products', () => {
    it('should create product successfully', async () => {
      const productData = {
        sku: 'NEW-001',
        name: 'New Product',
        description: 'New Description',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        make: 'Honda',
        model: 'Civic',
        year: 2021,
        condition: 'new' as const,
        price: 149.99,
        quantity: 10
      }

      const mockCreatedProduct = {
        id: '2',
        ...productData,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockDatabaseService.createProduct.mockResolvedValue({
        data: mockCreatedProduct,
        error: null
      })

      const request = createMockRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockCreatedProduct)
      expect(mockDatabaseService.createProduct).toHaveBeenCalledWith(productData)
    })

    it('should handle validation errors', async () => {
      const invalidData = {
        sku: '', // Invalid: empty string
        name: 'Product',
        description: 'Description',
        category_id: 'invalid-uuid', // Invalid: not a UUID
        make: 'Honda',
        model: 'Civic',
        year: 1800, // Invalid: too old
        condition: 'invalid' as any, // Invalid: not in enum
        price: -10, // Invalid: negative
        quantity: -1 // Invalid: negative
      }

      const request = createMockRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid product data')
      expect(data.details).toBeDefined()
      expect(Array.isArray(data.details)).toBe(true)
    })

    it('should handle database service errors', async () => {
      const productData = {
        sku: 'NEW-001',
        name: 'New Product',
        description: 'New Description',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        make: 'Honda',
        model: 'Civic',
        year: 2021,
        condition: 'new' as const,
        price: 149.99,
        quantity: 10
      }

      mockDatabaseService.createProduct.mockResolvedValue({
        data: null,
        error: 'SKU already exists'
      })

      const request = createMockRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('SKU already exists')
    })

    it('should handle malformed JSON', async () => {
      const request = createMockRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to create product')
    })

    it('should handle optional fields correctly', async () => {
      const productData = {
        sku: 'OPT-001',
        name: 'Product with Options',
        description: 'Description',
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        make: 'Ford',
        model: 'F-150',
        year: 2022,
        condition: 'refurbished' as const,
        price: 299.99,
        quantity: 3,
        part_number: 'PN-12345',
        original_price: 399.99,
        weight: 5.5,
        dimensions: {
          length: 10,
          width: 5,
          height: 3,
          unit: 'in' as const
        },
        specifications: {
          material: 'steel',
          color: 'black'
        },
        is_active: false
      }

      const mockCreatedProduct = {
        id: '3',
        ...productData,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockDatabaseService.createProduct.mockResolvedValue({
        data: mockCreatedProduct,
        error: null
      })

      const request = createMockRequest('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockCreatedProduct)
      expect(mockDatabaseService.createProduct).toHaveBeenCalledWith(productData)
    })
  })
})