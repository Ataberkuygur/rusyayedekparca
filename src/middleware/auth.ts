import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { Database } from '../types/database'

/**
 * Middleware to protect routes that require authentication
 */
export async function withAuth(
  request: NextRequest,
  requiredRole?: 'customer' | 'admin'
) {
  try {
    const response = NextResponse.next()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // If no session, redirect to login
    if (!session || sessionError) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If role is required, check user role
    if (requiredRole) {
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profileError || !userProfile) {
        console.error('Error fetching user profile:', profileError)
        const redirectUrl = new URL('/auth/login', request.url)
        return NextResponse.redirect(redirectUrl)
      }

      // Check if user has required role
      if (userProfile.role !== requiredRole) {
        // Redirect to appropriate page based on role
        if (requiredRole === 'admin' && userProfile.role === 'customer') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    return response
  } catch (error) {
    console.error('Auth middleware error:', error)
    const redirectUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }
}

/**
 * Middleware to redirect authenticated users away from auth pages
 */
export async function withGuest(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is authenticated, redirect to dashboard
    if (session) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo')
      const redirectUrl = redirectTo ? new URL(redirectTo, request.url) : new URL('/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (error) {
    console.error('Guest middleware error:', error)
    return NextResponse.next()
  }
}

/**
 * Get user session and profile for server-side rendering
 */
export async function getServerSession(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (!session || sessionError) {
      return { session: null, profile: null, error: sessionError?.message }
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    return {
      session,
      profile: profile || null,
      error: profileError?.message || null,
    }
  } catch (error) {
    return {
      session: null,
      profile: null,
      error: 'Failed to get server session',
    }
  }
}