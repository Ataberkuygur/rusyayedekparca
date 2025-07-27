import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services/users'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/users/stats - Get user statistics
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

    const stats = await UserService.getUserOrderStats(session.user.id)
    
    return NextResponse.json({ stats })
  } catch (error) {
    console.error('User stats GET error:', error)
    return NextResponse.json(
      { error: 'İstatistikler alınamadı' },
      { status: 500 }
    )
  }
}
