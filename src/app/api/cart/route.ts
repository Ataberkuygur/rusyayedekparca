import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CartItem } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get cart items for the user with product details
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products (
          id,
          sku,
          name,
          price,
          original_price,
          quantity,
          condition,
          make,
          model,
          year,
          images:product_images (
            id,
            url,
            alt_text,
            is_primary
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cart items:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cart items' },
        { status: 500 }
      )
    }

    // Calculate cart totals
    const subtotal = cartItems?.reduce((total: number, item: any) => {
      return total + (item.product?.price || 0) * item.quantity
    }, 0) || 0

    const itemCount = cartItems?.reduce((total: number, item: any) => {
      return total + item.quantity
    }, 0) || 0

    return NextResponse.json({
      items: cartItems as CartItem[],
      subtotal,
      itemCount,
      total: subtotal // Add tax/shipping calculation later
    })

  } catch (error) {
    console.error('Cart API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { product_id, quantity = 1 } = await request.json()

    if (!product_id || quantity < 1) {
      return NextResponse.json(
        { error: 'Product ID and valid quantity are required' },
        { status: 400 }
      )
    }

    // Check if product exists and has enough inventory
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, quantity, is_active')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (!product.is_active) {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      )
    }

    if (product.quantity < quantity) {
      return NextResponse.json(
        { error: `Only ${product.quantity} items available in stock` },
        { status: 400 }
      )
    }

    // Check if item already exists in cart
    const { data: existingItem, error: checkError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing cart item:', checkError)
      return NextResponse.json(
        { error: 'Failed to check cart' },
        { status: 500 }
      )
    }

    let result
    if (existingItem) {
      // Update existing cart item
      const newQuantity = existingItem.quantity + quantity
      
      if (newQuantity > product.quantity) {
        return NextResponse.json(
          { error: `Cannot add ${quantity} items. Only ${product.quantity - existingItem.quantity} more available` },
          { status: 400 }
        )
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single()

      result = { data, error }
    } else {
      // Create new cart item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id,
          quantity
        })
        .select()
        .single()

      result = { data, error }
    }

    if (result.error) {
      console.error('Error adding to cart:', result.error)
      return NextResponse.json(
        { error: 'Failed to add item to cart' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Item added to cart successfully',
      item: result.data
    })

  } catch (error) {
    console.error('Cart API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
