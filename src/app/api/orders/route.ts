import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { OrderService } from '@/services/orders'
import { handleApiError } from '@/utils/api'

// Order creation schema
const createOrderSchema = z.object({
  items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })).min(1),
  shipping_address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postal_code: z.string().min(1),
    country: z.string().min(1)
  }),
  billing_address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postal_code: z.string().min(1),
    country: z.string().min(1)
  }).optional(),
  payment_method: z.object({
    type: z.enum(['shopier', 'card', 'transfer']),
    payment_session_id: z.string().optional(),
    card_last_four: z.string().optional()
  }),
  notes: z.string().optional()
})

// Order query schema
const orderQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).optional().default(1),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).optional().default(10),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  user_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = createOrderSchema.parse(body)
    
    // Create order
    const result = await OrderService.createOrder(validatedData)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid order data',
        details: error.issues
      }, { status: 400 })
    }
    
    return handleApiError(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    // Validate query parameters
    const validatedQuery = orderQuerySchema.parse(queryParams)
    
    // Get orders
    const result = await OrderService.getOrders(validatedQuery)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }
    
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.issues
      }, { status: 400 })
    }
    
    return handleApiError(error)
  }
}
