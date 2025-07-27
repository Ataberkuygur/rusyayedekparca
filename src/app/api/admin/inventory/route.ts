import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@/services/admin'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/admin/inventory - Get inventory items
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

    const inventory = await AdminService.getInventoryItems(limit, offset)

    return NextResponse.json({ inventory })
  } catch (error) {
    console.error('Admin inventory GET error:', error)
    return NextResponse.json(
      { error: 'Envanter alınamadı' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/inventory - Bulk update inventory
export async function PUT(request: NextRequest) {
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
    const { updates } = body

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Güncellemeler array formatında olmalı' },
        { status: 400 }
      )
    }

    await AdminService.bulkUpdateInventory(updates)

    return NextResponse.json({ 
      message: 'Envanter başarıyla güncellendi',
      updatedCount: updates.length
    })
  } catch (error: any) {
    console.error('Admin inventory PUT error:', error)
    return NextResponse.json(
      { error: error.message || 'Envanter güncellenemedi' },
      { status: 500 }
    )
  }
}
