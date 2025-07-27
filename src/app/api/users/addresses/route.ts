import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services/users'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/users/addresses - Get user addresses
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

    const addresses = await UserService.getUserAddresses(session.user.id)
    
    return NextResponse.json({ addresses })
  } catch (error) {
    console.error('Addresses GET error:', error)
    return NextResponse.json(
      { error: 'Adresler alınamadı' },
      { status: 500 }
    )
  }
}

// POST /api/users/addresses - Create new address
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

    // Validate required fields
    if (!title || !first_name || !last_name || !phone || !address_line_1 || !city || !state || !postal_code || !country) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanları doldurun' },
        { status: 400 }
      )
    }

    const newAddress = await UserService.createUserAddress(session.user.id, {
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
      is_default: is_default || false
    })

    return NextResponse.json({ 
      message: 'Adres başarıyla eklendi',
      address: newAddress 
    }, { status: 201 })
  } catch (error) {
    console.error('Addresses POST error:', error)
    return NextResponse.json(
      { error: 'Adres eklenemedi' },
      { status: 500 }
    )
  }
}
