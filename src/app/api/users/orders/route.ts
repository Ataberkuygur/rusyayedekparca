import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services/users'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/users/orders - Get user order history
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const orders = await UserService.getUserOrderHistory(session.user.id, limit, offset)
    
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Order history GET error:', error)
    return NextResponse.json(
      { error: 'Sipariş geçmişi alınamadı' },
      { status: 500 }
    )
  }
}
