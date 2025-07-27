import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services/users'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/users/profile - Get user profile
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

    const profile = await UserService.getUserProfile(session.user.id)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Kullanıcı profili bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { error: 'Profil alınamadı' },
      { status: 500 }
    )
  }
}

// PUT /api/users/profile - Update user profile
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

    const body = await request.json()
    const { first_name, last_name, phone, date_of_birth } = body

    // Validate input
    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: 'Ad ve soyad gereklidir' },
        { status: 400 }
      )
    }

    const updatedProfile = await UserService.updateUserProfile(session.user.id, {
      first_name,
      last_name,
      phone,
      date_of_birth
    })

    return NextResponse.json({ 
      message: 'Profil başarıyla güncellendi',
      profile: updatedProfile 
    })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json(
      { error: 'Profil güncellenemedi' },
      { status: 500 }
    )
  }
}
