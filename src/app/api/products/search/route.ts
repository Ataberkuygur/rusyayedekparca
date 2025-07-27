import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '../../../../services/database'
import { ProductFilters } from '../../../../types'
import { z } from 'zod'

// Validation schema for search parameters
const searchParamsSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
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

// GET /api/products/search - Search products with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    const validatedParams = searchParamsSchema.parse(params)
    const { q: searchTerm, page, limit, ...filters } = validatedParams
    
    // Use the search functionality from DatabaseService
    const result = await DatabaseService.searchProducts(searchTerm, filters)
    
    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
    
    // Apply pagination to search results
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = result.data?.slice(startIndex, endIndex) || []
    const total = result.data?.length || 0
    
    return NextResponse.json({
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      searchTerm
    })
  } catch (error) {
    console.error('Error searching products:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid search parameters',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to search products'
    }, { status: 500 })
  }
}