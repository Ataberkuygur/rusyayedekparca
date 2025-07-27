import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@/services/admin'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET /api/admin/reports/sales - Generate sales report
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
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: 'Başlangıç ve bitiş tarihleri gerekli' },
        { status: 400 }
      )
    }

    const report = await AdminService.generateSalesReport(dateFrom, dateTo)

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Admin sales report GET error:', error)
    return NextResponse.json(
      { error: 'Satış raporu oluşturulamadı' },
      { status: 500 }
    )
  }
}
