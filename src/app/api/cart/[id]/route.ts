import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { quantity } = await request.json()

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      )
    }

    // Get the cart item to verify ownership and get product info
    const { data: cartItem, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products (
          id,
          quantity,
          is_active
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (cartError || !cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      )
    }

    // Check if product is still active and has enough inventory
    if (!cartItem.product?.is_active) {
      return NextResponse.json(
        { error: 'Product is no longer available' },
        { status: 400 }
      )
    }

    if (cartItem.product.quantity < quantity) {
      return NextResponse.json(
        { error: `Only ${cartItem.product.quantity} items available in stock` },
        { status: 400 }
      )
    }

    // Update the cart item
    const { data: updatedItem, error: updateError } = await supabase
      .from('cart_items')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating cart item:', updateError)
      return NextResponse.json(
        { error: 'Failed to update cart item' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Cart item updated successfully',
      item: updatedItem
    })

  } catch (error) {
    console.error('Cart item API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete the cart item (only if it belongs to the user)
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting cart item:', error)
      return NextResponse.json(
        { error: 'Failed to remove item from cart' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Item removed from cart successfully'
    })

  } catch (error) {
    console.error('Cart item API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
