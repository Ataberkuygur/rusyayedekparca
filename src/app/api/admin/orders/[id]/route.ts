import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@/services/admin'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// PUT /api/admin/orders/[id] - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const isAdmin = await AdminService.isAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      )
    }

    const orderId = params.id
    const body = await request.json()
    const { status, notes } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Sipariş durumu gerekli' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Geçersiz sipariş durumu' },
        { status: 400 }
      )
    }

    const order = await AdminService.updateOrderStatus(orderId, status, notes)

    return NextResponse.json({ 
      message: 'Sipariş durumu güncellendi',
      order 
    })
  } catch (error: any) {
    console.error('Admin order PUT error:', error)
    return NextResponse.json(
      { error: error.message || 'Sipariş güncellenemedi' },
      { status: 500 }
    )
  }
}
