import { NextResponse } from 'next/server'

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)
  
  if (error instanceof Error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
  
  return NextResponse.json({
    success: false,
    error: 'Internal server error'
  }, { status: 500 })
}

export function createSuccessResponse<T>(
  data: T, 
  status: number = 200,
  pagination?: ApiResponse['pagination']
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    ...(pagination && { pagination })
  }, { status })
}

export function createErrorResponse(
  error: string, 
  status: number = 400,
  details?: any
): NextResponse {
  return NextResponse.json({
    success: false,
    error,
    ...(details && { details })
  }, { status })
}

export function validateRequiredParams(params: Record<string, any>, required: string[]): void {
  const missing = required.filter(param => !params[param])
  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(', ')}`)
  }
}
