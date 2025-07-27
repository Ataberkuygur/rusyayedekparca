import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { OrderService } from '@/services/orders'
import { handleApiError } from '@/utils/api'

// Update status schema
const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  tracking_number: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    
    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 })
    }
    
    const result = await OrderService.getOrderById(orderId)
    
    if (!result.data) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: result.data
    }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const body = await request.json()
    
    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 })
    }
    
    // Validate request body
    const validatedData = updateStatusSchema.parse(body)
    
    let result
    if (validatedData.status === 'cancelled') {
      result = await OrderService.cancelOrder(orderId)
    } else {
      result = await OrderService.updateOrderStatus(orderId, validatedData.status)
      
      // Update tracking number if provided
      if (validatedData.tracking_number) {
        // This would need a separate method to update tracking number
        // For now, we'll include it in the response
      }
    }
    
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
        error: 'Invalid update data',
        details: error.issues
      }, { status: 400 })
    }
    
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    
    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 })
    }
    
    const result = await OrderService.cancelOrder(orderId)
    
    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Order cancelled successfully'
    }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
