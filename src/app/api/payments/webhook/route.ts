import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/services/payments'
import { OrderService } from '@/services/orders'

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for Shopier webhook
    const body = await request.text()
    
    // Parse form data from Shopier
    const formData = new URLSearchParams(body)
    const callbackData = {
      platform_order_id: formData.get('platform_order_id'),
      total_amount: formData.get('total_amount'),
      currency: formData.get('currency'),
      random_nr: formData.get('random_nr'),
      signature: formData.get('signature'),
      status: formData.get('status'),
      transaction_id: formData.get('transaction_id'),
      payment_date: formData.get('payment_date')
    }
    
    console.log('Shopier webhook received:', callbackData)
    
    // Verify the payment
    const verificationResult = await PaymentService.verifyPayment(callbackData)
    
    if (verificationResult.error) {
      console.error('Payment verification failed:', verificationResult.error)
      return NextResponse.json({
        success: false,
        error: 'Payment verification failed'
      }, { status: 400 })
    }
    
    const paymentData = verificationResult.data
    
    // Update order status based on payment result
    if (paymentData.status === 'completed') {
      // Payment successful - update order to confirmed
      await OrderService.updateOrderStatus(paymentData.order_id, 'confirmed')
      
      // You might also want to:
      // - Send confirmation email
      // - Update payment status in database
      // - Log the successful payment
      
      console.log(`Payment successful for order ${paymentData.order_id}`)
    } else {
      // Payment failed - update order to cancelled
      await OrderService.updateOrderStatus(paymentData.order_id, 'cancelled')
      
      console.log(`Payment failed for order ${paymentData.order_id}`)
    }
    
    // Shopier expects a simple "OK" response
    return new NextResponse('OK', { status: 200 })
    
  } catch (error) {
    console.error('Shopier webhook error:', error)
    
    // Return error but don't reveal internal details
    return NextResponse.json({
      success: false,
      error: 'Webhook processing failed'
    }, { status: 500 })
  }
}

// Handle GET requests (for testing webhook URL)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Shopier webhook endpoint is active',
    timestamp: new Date().toISOString()
  }, { status: 200 })
}
