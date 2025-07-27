import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@/services/admin'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/admin/products - Get products for admin
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

    // Check if user is admin
    const isAdmin = await AdminService.isAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        images:product_images(url, alt_text, is_primary),
        inventory(quantity, minimum_stock, maximum_stock)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error('Ürünler alınamadı')
    }

    return NextResponse.json({ products: products || [] })
  } catch (error) {
    console.error('Admin products GET error:', error)
    return NextResponse.json(
      { error: 'Ürünler alınamadı' },
      { status: 500 }
    )
  }
}

// POST /api/admin/products - Create new product
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

    // Check if user is admin
    const isAdmin = await AdminService.isAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      sku,
      name,
      description,
      category_id,
      make,
      model,
      year,
      part_number,
      condition,
      price,
      original_price,
      quantity,
      weight,
      dimensions,
      specifications,
      is_active
    } = body

    // Validate required fields
    if (!sku || !name || !description || !category_id || !make || !model || !year || !price || quantity === undefined) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanları doldurun' },
        { status: 400 }
      )
    }

    const product = await AdminService.createProduct({
      sku,
      name,
      description,
      category_id,
      make,
      model,
      year: parseInt(year),
      part_number,
      condition: condition || 'new',
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : undefined,
      quantity: parseInt(quantity),
      weight: weight ? parseFloat(weight) : undefined,
      dimensions,
      specifications,
      is_active: is_active !== false
    })

    return NextResponse.json({ 
      message: 'Ürün başarıyla oluşturuldu',
      product 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Admin products POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Ürün oluşturulamadı' },
      { status: 500 }
    )
  }
}
