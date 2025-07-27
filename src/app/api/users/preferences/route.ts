import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services/users'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/users/preferences - Get user preferences
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

    const preferences = await UserService.getUserPreferences(session.user.id)
    
    // Return default preferences if none exist
    const defaultPreferences = {
      newsletter_subscribed: false,
      sms_notifications: true,
      email_notifications: true,
      preferred_language: 'tr',
      preferred_currency: 'TRY'
    }

    return NextResponse.json({ 
      preferences: preferences || defaultPreferences 
    })
  } catch (error) {
    console.error('Preferences GET error:', error)
    return NextResponse.json(
      { error: 'Tercihler alınamadı' },
      { status: 500 }
    )
  }
}

// PUT /api/users/preferences - Update user preferences
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
    const {
      newsletter_subscribed,
      sms_notifications,
      email_notifications,
      preferred_language,
      preferred_currency
    } = body

    // Validate language and currency
    if (preferred_language && !['tr', 'en'].includes(preferred_language)) {
      return NextResponse.json(
        { error: 'Geçersiz dil seçimi' },
        { status: 400 }
      )
    }

    if (preferred_currency && !['TRY', 'USD', 'EUR'].includes(preferred_currency)) {
      return NextResponse.json(
        { error: 'Geçersiz para birimi seçimi' },
        { status: 400 }
      )
    }

    const updates: any = {}
    if (newsletter_subscribed !== undefined) updates.newsletter_subscribed = newsletter_subscribed
    if (sms_notifications !== undefined) updates.sms_notifications = sms_notifications
    if (email_notifications !== undefined) updates.email_notifications = email_notifications
    if (preferred_language !== undefined) updates.preferred_language = preferred_language
    if (preferred_currency !== undefined) updates.preferred_currency = preferred_currency

    const updatedPreferences = await UserService.createOrUpdateUserPreferences(
      session.user.id,
      updates
    )

    return NextResponse.json({ 
      message: 'Tercihler başarıyla güncellendi',
      preferences: updatedPreferences 
    })
  } catch (error) {
    console.error('Preferences PUT error:', error)
    return NextResponse.json(
      { error: 'Tercihler güncellenemedi' },
      { status: 500 }
    )
  }
}
