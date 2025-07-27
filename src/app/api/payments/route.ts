import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PaymentService } from '@/services/payments'
import { handleApiError } from '@/utils/api'

// Create payment session schema
const createPaymentSchema = z.object({
  order_id: z.string(),
  amount: z.number().min(0.01),
  currency: z.string().default('TRY'),
  product_name: z.string(),
  product_type: z.number().min(0).max(1), // 0 for physical, 1 for digital
  buyer_name: z.string(),
  buyer_email: z.string().email(),
  buyer_phone: z.string().optional(),
  buyer_address: z.string().optional()
})

// Payment verification schema
const verifyPaymentSchema = z.object({
  platform_order_id: z.string(),
  total_amount: z.string(),
  currency: z.string(),
  random_nr: z.string(),
  signature: z.string(),
  status: z.string(),
  transaction_id: z.string().optional(),
  payment_date: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = createPaymentSchema.parse(body)
    
    // Create Shopier payment session
    const result = await PaymentService.createPaymentSession({
      order_id: validatedData.order_id,
      amount: validatedData.amount,
      currency: validatedData.currency,
      product_name: validatedData.product_name,
      product_type: validatedData.product_type,
      buyer_name: validatedData.buyer_name,
      buyer_email: validatedData.buyer_email,
      buyer_phone: validatedData.buyer_phone,
      buyer_address: validatedData.buyer_address,
      random_nr: '' // Will be generated in the service
    })
    
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid payment data',
        details: error.issues
      }, { status: 400 })
    }
    
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate callback data
    const validatedData = verifyPaymentSchema.parse(body)
    
    // Verify payment with Shopier
    const result = await PaymentService.verifyPayment(validatedData)
    
    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      data: result.data
    }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid verification data',
        details: error.issues
      }, { status: 400 })
    }
    
    return handleApiError(error)
  }
}
