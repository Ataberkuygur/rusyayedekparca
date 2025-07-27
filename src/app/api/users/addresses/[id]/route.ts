import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services/users'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// PUT /api/users/addresses/[id] - Update address
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

    const addressId = params.id
    const body = await request.json()
    
    const {
      title,
      first_name,
      last_name,
      phone,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,
      is_default
    } = body

    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (first_name !== undefined) updates.first_name = first_name
    if (last_name !== undefined) updates.last_name = last_name
    if (phone !== undefined) updates.phone = phone
    if (address_line_1 !== undefined) updates.address_line_1 = address_line_1
    if (address_line_2 !== undefined) updates.address_line_2 = address_line_2
    if (city !== undefined) updates.city = city
    if (state !== undefined) updates.state = state
    if (postal_code !== undefined) updates.postal_code = postal_code
    if (country !== undefined) updates.country = country
    if (is_default !== undefined) updates.is_default = is_default

    const updatedAddress = await UserService.updateUserAddress(
      addressId,
      session.user.id,
      updates
    )

    return NextResponse.json({ 
      message: 'Adres başarıyla güncellendi',
      address: updatedAddress 
    })
  } catch (error) {
    console.error('Address PUT error:', error)
    return NextResponse.json(
      { error: 'Adres güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/addresses/[id] - Delete address
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

    const addressId = params.id

    await UserService.deleteUserAddress(addressId, session.user.id)

    return NextResponse.json({ 
      message: 'Adres başarıyla silindi' 
    })
  } catch (error) {
    console.error('Address DELETE error:', error)
    return NextResponse.json(
      { error: 'Adres silinemedi' },
      { status: 500 }
    )
  }
}

// PATCH /api/users/addresses/[id] - Set as default address
export async function PATCH(
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

    const addressId = params.id
    const body = await request.json()
    
    if (body.action === 'set_default') {
      await UserService.setDefaultAddress(addressId, session.user.id)
      
      return NextResponse.json({ 
        message: 'Varsayılan adres ayarlandı' 
      })
    }

    return NextResponse.json(
      { error: 'Geçersiz işlem' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Address PATCH error:', error)
    return NextResponse.json(
      { error: 'İşlem gerçekleştirilemedi' },
      { status: 500 }
    )
  }
}
