import { DatabaseResponse } from '@/types'

// Shopier API configuration
const SHOPIER_API_URL = 'https://www.shopier.com/ShowProduct/api_pay4.php'
const SHOPIER_SUCCESS_URL = process.env.SHOPIER_SUCCESS_URL || 'http://localhost:3000/payment/success'
const SHOPIER_ERROR_URL = process.env.SHOPIER_ERROR_URL || 'http://localhost:3000/payment/error'

export interface ShopierPaymentData {
  amount: number // Amount in Turkish Lira
  currency: string // TRY for Turkish Lira
  product_name: string
  product_type: number // 1 for digital, 0 for physical
  buyer_name: string
  buyer_email: string
  buyer_phone?: string
  buyer_address?: string
  order_id: string
  random_nr: string
  platform_order_id?: string
}

export interface ShopierPaymentResponse {
  url: string
  order_id: string
  status: string
  random_nr: string
}

export class PaymentService {
  /**
   * Create a Shopier payment session
   */
  static async createPaymentSession(data: ShopierPaymentData): Promise<DatabaseResponse<ShopierPaymentResponse>> {
    try {
      const API_KEY = process.env.SHOPIER_API_KEY
      const API_SECRET = process.env.SHOPIER_API_SECRET
      
      if (!API_KEY || !API_SECRET) {
        throw new Error('Shopier API credentials not configured')
      }

      // Generate random number for security
      const randomNumber = Math.random().toString(36).substring(2, 15)
      
      // Prepare form data for Shopier API
      const formData = new FormData()
      formData.append('API_key', API_KEY)
      formData.append('website_index', '1') // Your website index from Shopier
      formData.append('platform_order_id', data.order_id)
      formData.append('product_name', data.product_name)
      formData.append('product_type', data.product_type.toString())
      formData.append('buyer_name', data.buyer_name)
      formData.append('buyer_email', data.buyer_email)
      formData.append('buyer_phone', data.buyer_phone || '')
      formData.append('buyer_address', data.buyer_address || '')
      formData.append('total_amount', data.amount.toString())
      formData.append('currency', data.currency)
      formData.append('random_nr', randomNumber)
      formData.append('success_url', SHOPIER_SUCCESS_URL)
      formData.append('fail_url', SHOPIER_ERROR_URL)
      
      // Generate signature for security
      const signatureData = `${API_KEY}${randomNumber}${data.amount}${data.currency}${API_SECRET}`
      const signature = await this.generateSignature(signatureData)
      formData.append('signature', signature)

      const response = await fetch(SHOPIER_API_URL, {
        method: 'POST',
        body: formData
      })

      const responseText = await response.text()
      
      // Shopier returns a redirect URL or error message
      if (responseText.includes('http')) {
        return {
          data: {
            url: responseText.trim(),
            order_id: data.order_id,
            status: 'created',
            random_nr: randomNumber
          },
          error: null
        }
      } else {
        throw new Error(responseText)
      }
    } catch (error) {
      console.error('Shopier payment session creation failed:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Payment session creation failed'
      }
    }
  }

  /**
   * Verify Shopier payment callback
   */
  static async verifyPayment(callbackData: any): Promise<DatabaseResponse<any>> {
    try {
      const API_SECRET = process.env.SHOPIER_API_SECRET
      
      if (!API_SECRET) {
        throw new Error('Shopier API secret not configured')
      }

      // Verify signature from callback
      const expectedSignature = await this.generateSignature(
        `${callbackData.platform_order_id}${callbackData.total_amount}${callbackData.random_nr}${API_SECRET}`
      )

      if (callbackData.signature !== expectedSignature) {
        throw new Error('Invalid payment signature')
      }

      return {
        data: {
          order_id: callbackData.platform_order_id,
          amount: parseFloat(callbackData.total_amount),
          currency: callbackData.currency,
          status: callbackData.status === '1' ? 'completed' : 'failed',
          transaction_id: callbackData.transaction_id,
          payment_date: callbackData.payment_date
        },
        error: null
      }
    } catch (error) {
      console.error('Shopier payment verification failed:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Payment verification failed'
      }
    }
  }

  /**
   * Get payment status from Shopier
   */
  static async getPaymentStatus(orderId: string): Promise<DatabaseResponse<any>> {
    try {
      const API_KEY = process.env.SHOPIER_API_KEY
      const API_SECRET = process.env.SHOPIER_API_SECRET
      
      if (!API_KEY || !API_SECRET) {
        throw new Error('Shopier API credentials not configured')
      }

      // This would typically involve calling Shopier's status check API
      // For now, returning a placeholder response
      return {
        data: {
          order_id: orderId,
          status: 'pending'
        },
        error: null
      }
    } catch (error) {
      console.error('Shopier payment status check failed:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Payment status check failed'
      }
    }
  }

  /**
   * Cancel a payment (if supported by Shopier)
   */
  static async cancelPayment(orderId: string): Promise<DatabaseResponse<any>> {
    try {
      // Shopier may not support direct cancellation
      // This would depend on their API capabilities
      return {
        data: {
          order_id: orderId,
          status: 'cancelled'
        },
        error: null
      }
    } catch (error) {
      console.error('Shopier payment cancellation failed:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Payment cancellation failed'
      }
    }
  }

  /**
   * Process refund (if supported by Shopier)
   */
  static async createRefund(orderId: string, amount?: number): Promise<DatabaseResponse<any>> {
    try {
      // Shopier refund process would be implemented here
      // This might require manual approval or different API calls
      return {
        data: {
          order_id: orderId,
          refund_amount: amount,
          status: 'refund_requested'
        },
        error: null
      }
    } catch (error) {
      console.error('Shopier refund creation failed:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Refund creation failed'
      }
    }
  }

  /**
   * Generate SHA256 signature for Shopier API
   */
  private static async generateSignature(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}
