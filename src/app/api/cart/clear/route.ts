import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete all cart items for the user
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error clearing cart:', error)
      return NextResponse.json(
        { error: 'Failed to clear cart' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Cart cleared successfully'
    })

  } catch (error) {
    console.error('Clear cart API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
