import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@/services/admin'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/admin/dashboard - Get admin dashboard stats
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

    const stats = await AdminService.getDashboardStats()
    
    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Admin dashboard GET error:', error)
    return NextResponse.json(
      { error: 'Dashboard verileri alınamadı' },
      { status: 500 }
    )
  }
}
