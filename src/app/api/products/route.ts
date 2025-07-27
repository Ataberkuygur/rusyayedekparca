import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '../../../services/database'
import { CreateProductData, ProductFilters } from '../../../types'
import { z } from 'zod'

// Validation schemas
const createProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category_id: z.string().uuid('Invalid category ID'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  part_number: z.string().optional(),
  condition: z.enum(['new', 'used', 'refurbished']),
  price: z.number().positive('Price must be positive'),
  original_price: z.number().positive().optional(),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(['in', 'cm'])
  }).optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  is_active: z.boolean().optional().default(true)
})

const productFiltersSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().int().optional(),
  category_id: z.string().uuid().optional(),
  condition: z.enum(['new', 'used', 'refurbished']).optional(),
  min_price: z.coerce.number().positive().optional(),
  max_price: z.coerce.number().positive().optional(),
  in_stock: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20)
})

// GET /api/products - Get products with optional filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    const validatedParams = productFiltersSchema.parse(params)
    
    const result = await DatabaseService.getProducts(validatedParams)
    
    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit)
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid parameters',
        details: error.issues
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch products'
    }, { status: 500 })
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createProductSchema.parse(body)
    
    const result = await DatabaseService.createProduct(validatedData)
    
    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      data: result.data
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid product data',
        details: error.issues
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create product'
    }, { status: 500 })
  }
}