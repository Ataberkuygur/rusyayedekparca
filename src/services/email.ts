import { Order, OrderItem } from '@/types'

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface EmailData {
  to: string
  from?: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private static readonly FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourcarparts.com'
  private static readonly COMPANY_NAME = 'YedekParca'
  
  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(order: Order): Promise<boolean> {
    try {
      if (!order.user?.email) {
        throw new Error('No email address found for user')
      }

      const template = this.generateOrderConfirmationTemplate(order)
      
      const emailData: EmailData = {
        to: order.user.email,
        from: this.FROM_EMAIL,
        subject: template.subject,
        html: template.html,
        text: template.text
      }

      return await this.sendEmail(emailData)
    } catch (error) {
      console.error('Failed to send order confirmation email:', error)
      return false
    }
  }

  /**
   * Send order status update email
   */
  static async sendOrderStatusUpdate(order: Order, previousStatus: string): Promise<boolean> {
    try {
      if (!order.user?.email) {
        throw new Error('No email address found for user')
      }

      const template = this.generateStatusUpdateTemplate(order, previousStatus)
      
      const emailData: EmailData = {
        to: order.user.email,
        from: this.FROM_EMAIL,
        subject: template.subject,
        html: template.html,
        text: template.text
      }

      return await this.sendEmail(emailData)
    } catch (error) {
      console.error('Failed to send order status update email:', error)
      return false
    }
  }

  /**
   * Send shipping notification email
   */
  static async sendShippingNotification(order: Order): Promise<boolean> {
    try {
      if (!order.user?.email) {
        throw new Error('No email address found for user')
      }

      const template = this.generateShippingTemplate(order)
      
      const emailData: EmailData = {
        to: order.user.email,
        from: this.FROM_EMAIL,
        subject: template.subject,
        html: template.html,
        text: template.text
      }

      return await this.sendEmail(emailData)
    } catch (error) {
      console.error('Failed to send shipping notification email:', error)
      return false
    }
  }

  /**
   * Generate order confirmation email template
   */
  private static generateOrderConfirmationTemplate(order: Order): EmailTemplate {
    const subject = `Sipariş Onayı - ${order.order_number}`
    
    const itemsHtml = order.items?.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.product?.name || 'Ürün'}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₺${item.unit_price.toFixed(2)}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₺${item.total_price.toFixed(2)}
        </td>
      </tr>
    `).join('') || ''

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50;">${this.COMPANY_NAME}</h1>
          </div>
          
          <h2 style="color: #27ae60;">Siparişiniz Alındı!</h2>
          
          <p>Merhaba ${order.user?.first_name || ''} ${order.user?.last_name || ''},</p>
          
          <p>Siparişiniz başarıyla alınmıştır. Aşağıda sipariş detaylarınızı bulabilirsiniz:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Sipariş Bilgileri</h3>
            <p><strong>Sipariş Numarası:</strong> ${order.order_number}</p>
            <p><strong>Sipariş Tarihi:</strong> ${new Date(order.created_at).toLocaleDateString('tr-TR')}</p>
            <p><strong>Durum:</strong> ${this.getStatusText(order.status)}</p>
          </div>
          
          <h3>Sipariş Detayları</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Ürün</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Adet</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Birim Fiyat</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Toplam</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="text-align: right; margin-top: 20px;">
            <p><strong>Ara Toplam: ₺${order.subtotal.toFixed(2)}</strong></p>
            <p><strong>KDV: ₺${order.tax.toFixed(2)}</strong></p>
            <p><strong>Kargo: ₺${order.shipping.toFixed(2)}</strong></p>
            <h3 style="color: #27ae60;">Genel Toplam: ₺${order.total.toFixed(2)}</h3>
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 30px 0;">
            <h3 style="margin-top: 0; color: #2980b9;">Teslimat Adresi</h3>
            <p>
              ${order.shipping_address?.street}<br>
              ${order.shipping_address?.city}, ${order.shipping_address?.state}<br>
              ${order.shipping_address?.zip_code} ${order.shipping_address?.country}
            </p>
          </div>
          
          <p>Siparişinizle ilgili herhangi bir sorunuz varsa, lütfen bizimle iletişime geçin.</p>
          
          <p>Teşekkürler,<br>
          ${this.COMPANY_NAME} Ekibi</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
          </p>
        </div>
      </body>
      </html>
    `

    const text = `
Sipariş Onayı - ${order.order_number}

Merhaba ${order.user?.first_name || ''} ${order.user?.last_name || ''},

Siparişiniz başarıyla alınmıştır.

Sipariş Numarası: ${order.order_number}
Sipariş Tarihi: ${new Date(order.created_at).toLocaleDateString('tr-TR')}
Durum: ${this.getStatusText(order.status)}

Toplam Tutar: ₺${order.total.toFixed(2)}

Teşekkürler,
${this.COMPANY_NAME} Ekibi
    `

    return { subject, html, text }
  }

  /**
   * Generate status update email template
   */
  private static generateStatusUpdateTemplate(order: Order, previousStatus: string): EmailTemplate {
    const subject = `Sipariş Durumu Güncellendi - ${order.order_number}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50;">${this.COMPANY_NAME}</h1>
          </div>
          
          <h2 style="color: #3498db;">Sipariş Durumu Güncellendi</h2>
          
          <p>Merhaba ${order.user?.first_name || ''} ${order.user?.last_name || ''},</p>
          
          <p>Sipariş numarası ${order.order_number} için durum güncellemesi:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Önceki Durum:</strong> ${this.getStatusText(previousStatus)}</p>
            <p><strong>Yeni Durum:</strong> <span style="color: #27ae60;">${this.getStatusText(order.status)}</span></p>
            ${order.tracking_number ? `<p><strong>Kargo Takip No:</strong> ${order.tracking_number}</p>` : ''}
          </div>
          
          <p>Siparişinizle ilgili herhangi bir sorunuz varsa, lütfen bizimle iletişime geçin.</p>
          
          <p>Teşekkürler,<br>
          ${this.COMPANY_NAME} Ekibi</p>
        </div>
      </body>
      </html>
    `

    const text = `
Sipariş Durumu Güncellendi - ${order.order_number}

Merhaba ${order.user?.first_name || ''} ${order.user?.last_name || ''},

Sipariş numarası ${order.order_number} için durum güncellemesi:
Önceki Durum: ${this.getStatusText(previousStatus)}
Yeni Durum: ${this.getStatusText(order.status)}

Teşekkürler,
${this.COMPANY_NAME} Ekibi
    `

    return { subject, html, text }
  }

  /**
   * Generate shipping notification template
   */
  private static generateShippingTemplate(order: Order): EmailTemplate {
    const subject = `Siparişiniz Kargoya Verildi - ${order.order_number}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50;">${this.COMPANY_NAME}</h1>
          </div>
          
          <h2 style="color: #27ae60;">Siparişiniz Kargoya Verildi!</h2>
          
          <p>Merhaba ${order.user?.first_name || ''} ${order.user?.last_name || ''},</p>
          
          <p>Siparişiniz kargoya verilmiştir ve yakında adresinize teslim edilecektir.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Sipariş Numarası:</strong> ${order.order_number}</p>
            ${order.tracking_number ? `<p><strong>Kargo Takip No:</strong> <span style="color: #27ae60; font-weight: bold;">${order.tracking_number}</span></p>` : ''}
            <p><strong>Tahmini Teslimat:</strong> 2-3 iş günü</p>
          </div>
          
          <p>Kargo takip numaranızı kullanarak siparişinizin durumunu takip edebilirsiniz.</p>
          
          <p>Teşekkürler,<br>
          ${this.COMPANY_NAME} Ekibi</p>
        </div>
      </body>
      </html>
    `

    const text = `
Siparişiniz Kargoya Verildi - ${order.order_number}

Merhaba ${order.user?.first_name || ''} ${order.user?.last_name || ''},

Siparişiniz kargoya verilmiştir.
Sipariş Numarası: ${order.order_number}
${order.tracking_number ? `Kargo Takip No: ${order.tracking_number}` : ''}

Teşekkürler,
${this.COMPANY_NAME} Ekibi
    `

    return { subject, html, text }
  }

  /**
   * Get status text in Turkish
   */
  private static getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'Beklemede',
      'confirmed': 'Onaylandı',
      'processing': 'Hazırlanıyor',
      'shipped': 'Kargoya Verildi',
      'delivered': 'Teslim Edildi',
      'cancelled': 'İptal Edildi',
      'refunded': 'İade Edildi'
    }
    
    return statusMap[status] || status
  }

  /**
   * Send email using your preferred email service
   * This is a placeholder - implement with your email provider (SendGrid, Mailgun, etc.)
   */
  private static async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // Placeholder for email sending logic
      // You would integrate with your email service here
      console.log('Sending email:', emailData.subject, 'to:', emailData.to)
      
      // Example with fetch to a hypothetical email service:
      /*
      const response = await fetch('https://api.your-email-service.com/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`
        },
        body: JSON.stringify(emailData)
      })
      
      return response.ok
      */
      
      // For now, just log the email and return true
      return true
    } catch (error) {
      console.error('Email sending failed:', error)
      return false
    }
  }
}
