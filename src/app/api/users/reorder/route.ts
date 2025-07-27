import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services/users'
import { supabase } from '@/lib/supabase'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// POST /api/users/reorder - Reorder from previous order
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Sipariş ID gerekli' },
        { status: 400 }
      )
    }

    // Get items from previous order
    const cartItems = await UserService.reorderFromPreviousOrder(session.user.id, orderId)
    
    if (!cartItems.length) {
      return NextResponse.json(
        { error: 'Sipariş ürünleri bulunamadı' },
        { status: 404 }
      )
    }

    // Add items to current cart directly in database
    for (const item of cartItems) {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('product_id', item.product_id)
        .single()

      if (existingItem) {
        // Update quantity if item exists
        await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItem.quantity + item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
      } else {
        // Add new item to cart
        await supabase
          .from('cart_items')
          .insert({
            user_id: session.user.id,
            product_id: item.product_id,
            quantity: item.quantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }
    }

    return NextResponse.json({ 
      message: 'Ürünler sepete eklendi',
      itemsAdded: cartItems.length 
    })
  } catch (error) {
    console.error('Reorder POST error:', error)
    return NextResponse.json(
      { error: 'Tekrar sipariş verilemedi' },
      { status: 500 }
    )
  }
}
