import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '../../../../services/database'
import { UpdateProductData } from '../../../../types'
import { z } from 'zod'

// Validation schema for product updates
const updateProductSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category_id: z.string().uuid().optional(),
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2).optional(),
  part_number: z.string().optional(),
  condition: z.enum(['new', 'used', 'refurbished']).optional(),
  price: z.number().positive().optional(),
  original_price: z.number().positive().optional(),
  quantity: z.number().int().min(0).optional(),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(['in', 'cm'])
  }).optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  is_active: z.boolean().optional()
})

// GET /api/products/[id] - Get a specific product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid product ID'
      }, { status: 400 })
    }
    
    const result = await DatabaseService.getProductById(id)
    
    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch product'
    }, { status: 500 })
  }
}

// PUT /api/products/[id] - Update a specific product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid product ID'
      }, { status: 400 })
    }
    
    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)
    
    const result = await DatabaseService.updateProduct(id, { ...validatedData, id })
    
    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Error updating product:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid product data',
        details: error.issues
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update product'
    }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Delete a specific product (soft delete by setting is_active to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid product ID'
      }, { status: 400 })
    }
    
    // Soft delete by setting is_active to false
    const result = await DatabaseService.updateProduct(id, { id, is_active: false })
    
    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete product'
    }, { status: 500 })
  }
}