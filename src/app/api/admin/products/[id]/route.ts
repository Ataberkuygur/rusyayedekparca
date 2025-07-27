import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@/services/admin'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// PUT /api/admin/products/[id] - Update product
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

    const productId = params.id
    const body = await request.json()

    const updates: any = {}
    if (body.sku !== undefined) updates.sku = body.sku
    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.category_id !== undefined) updates.category_id = body.category_id
    if (body.make !== undefined) updates.make = body.make
    if (body.model !== undefined) updates.model = body.model
    if (body.year !== undefined) updates.year = parseInt(body.year)
    if (body.part_number !== undefined) updates.part_number = body.part_number
    if (body.condition !== undefined) updates.condition = body.condition
    if (body.price !== undefined) updates.price = parseFloat(body.price)
    if (body.original_price !== undefined) updates.original_price = body.original_price ? parseFloat(body.original_price) : null
    if (body.quantity !== undefined) updates.quantity = parseInt(body.quantity)
    if (body.weight !== undefined) updates.weight = body.weight ? parseFloat(body.weight) : null
    if (body.dimensions !== undefined) updates.dimensions = body.dimensions
    if (body.specifications !== undefined) updates.specifications = body.specifications
    if (body.is_active !== undefined) updates.is_active = body.is_active

    const product = await AdminService.updateProduct(productId, updates)

    return NextResponse.json({ 
      message: 'Ürün başarıyla güncellendi',
      product 
    })
  } catch (error: any) {
    console.error('Admin product PUT error:', error)
    return NextResponse.json(
      { error: error.message || 'Ürün güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
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

    const productId = params.id

    await AdminService.deleteProduct(productId)

    return NextResponse.json({ 
      message: 'Ürün başarıyla silindi' 
    })
  } catch (error: any) {
    console.error('Admin product DELETE error:', error)
    return NextResponse.json(
      { error: error.message || 'Ürün silinemedi' },
      { status: 500 }
    )
  }
}
