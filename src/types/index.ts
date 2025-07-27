// Core database types matching Supabase schema

export interface User {
  id: string
  email: string
  password?: string // Only used for registration, not stored in frontend
  first_name: string
  last_name: string
  phone?: string
  role: 'customer' | 'admin'
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  type: 'billing' | 'shipping'
  street: string
  city: string
  state: string
  zip_code: string
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description: string
  category_id: string
  make: string
  model: string
  year: number
  part_number?: string
  condition: 'new' | 'used' | 'refurbished'
  price: number
  original_price?: number
  quantity: number
  weight?: number
  dimensions?: string // JSON string for dimensions object
  specifications?: string // JSON string for specifications object
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations
  category?: ProductCategory
  images?: ProductImage[]
  compatibility?: VehicleCompatibility[]
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string
  is_primary: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface VehicleCompatibility {
  id: string
  product_id: string
  make: string
  model: string
  year_start: number
  year_end: number
  engine?: string
  trim?: string
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  // Relations
  product?: Product
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Order {
  id: string
  order_number: string
  user_id: string
  status: OrderStatus
  subtotal: number
  tax: number
  shipping: number
  total: number
  shipping_address_id: string
  billing_address_id: string
  payment_method: string
  payment_status: PaymentStatus
  payment_intent_id?: string
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at: string
  // Relations
  user?: User
  shipping_address?: Address
  billing_address?: Address
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  updated_at: string
  // Relations
  product?: Product
}

// Utility types for API requests
export interface CreateProductData {
  sku: string
  name: string
  description: string
  category_id: string
  make: string
  model: string
  year: number
  part_number?: string
  condition: 'new' | 'used' | 'refurbished'
  price: number
  original_price?: number
  quantity: number
  weight?: number
  dimensions?: Record<string, any>
  specifications?: Record<string, any>
  is_active?: boolean
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string
}

export interface ProductFilters {
  make?: string
  model?: string
  year?: number
  category_id?: string
  condition?: string
  min_price?: number
  max_price?: number
  in_stock?: boolean
}

export interface ShippingInfo {
  address_id: string
}

export interface PaymentInfo {
  method: string
  payment_intent_id?: string
}

export interface Dimensions {
  length: number
  width: number
  height: number
  unit: 'in' | 'cm'
}

// Cart-related types
export interface CartSummary {
  items: CartItem[]
  subtotal: number
  itemCount: number
  total: number
  tax?: number
  shipping?: number
}

export interface AddToCartRequest {
  product_id: string
  quantity?: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface CartValidationIssue {
  itemId: string
  productName: string
  issue: string
  maxQuantity?: number
}

export interface CartValidationResult {
  valid: boolean
  issues: CartValidationIssue[]
}

// Order creation types
export interface CreateOrderData {
  items: Array<{
    product_id: string
    quantity: number
    price: number
  }>
  shipping_address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  billing_address?: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  payment_method: {
    type: 'shopier' | 'card' | 'transfer'
    payment_session_id?: string
    card_last_four?: string
  }
  notes?: string
}

export interface OrderFilters {
  page?: number
  limit?: number
  status?: OrderStatus
  user_id?: string
  start_date?: string
  end_date?: string
}

// Database response types
export interface DatabaseResponse<T> {
  data: T | null
  error: any
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}