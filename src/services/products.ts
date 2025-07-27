// Product service layer for frontend API calls
// Provides typed methods for product-related operations

import { 
  Product, 
  CreateProductData, 
  UpdateProductData, 
  ProductFilters, 
  ProductImage,
  PaginatedResponse 
} from '../types'

export interface ProductSearchParams extends ProductFilters {
  q: string
  page?: number
  limit?: number
}

export interface ProductListParams extends ProductFilters {
  page?: number
  limit?: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class ProductService {
  private static baseUrl = '/api/products'

  // Get products with optional filtering and pagination
  static async getProducts(params?: ProductListParams): Promise<PaginatedApiResponse<Product>> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString())
          }
        })
      }
      
      const url = `${this.baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching products:', error)
      return {
        success: false,
        error: 'Failed to fetch products',
        data: []
      }
    }
  }

  // Get a specific product by ID
  static async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: 'Product not found'
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching product:', error)
      return {
        success: false,
        error: 'Failed to fetch product'
      }
    }
  }

  // Search products
  static async searchProducts(params: ProductSearchParams): Promise<PaginatedApiResponse<Product>> {
    try {
      const searchParams = new URLSearchParams()
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
      
      const response = await fetch(`${this.baseUrl}/search?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error searching products:', error)
      return {
        success: false,
        error: 'Failed to search products',
        data: []
      }
    }
  }

  // Create a new product
  static async createProduct(productData: CreateProductData): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to create product',
          details: result.details
        }
      }
      
      return result
    } catch (error) {
      console.error('Error creating product:', error)
      return {
        success: false,
        error: 'Failed to create product'
      }
    }
  }

  // Update a product
  static async updateProduct(id: string, updates: Partial<UpdateProductData>): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to update product',
          details: result.details
        }
      }
      
      return result
    } catch (error) {
      console.error('Error updating product:', error)
      return {
        success: false,
        error: 'Failed to update product'
      }
    }
  }

  // Delete a product (soft delete)
  static async deleteProduct(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to delete product'
        }
      }
      
      return {
        success: true,
        data: true
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      return {
        success: false,
        error: 'Failed to delete product'
      }
    }
  }

  // Upload product image
  static async uploadProductImage(
    productId: string, 
    file: File, 
    metadata?: {
      alt_text?: string
      is_primary?: boolean
      order_index?: number
    }
  ): Promise<ApiResponse<ProductImage>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata))
      }
      
      const response = await fetch(`${this.baseUrl}/${productId}/images`, {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to upload image'
        }
      }
      
      return result
    } catch (error) {
      console.error('Error uploading product image:', error)
      return {
        success: false,
        error: 'Failed to upload image'
      }
    }
  }

  // Get product images
  static async getProductImages(productId: string): Promise<ApiResponse<ProductImage[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/${productId}/images`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching product images:', error)
      return {
        success: false,
        error: 'Failed to fetch images',
        data: []
      }
    }
  }

  // Update product image
  static async updateProductImage(
    productId: string, 
    imageId: string, 
    updates: {
      alt_text?: string
      is_primary?: boolean
      order_index?: number
    }
  ): Promise<ApiResponse<ProductImage>> {
    try {
      const response = await fetch(`${this.baseUrl}/${productId}/images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to update image'
        }
      }
      
      return result
    } catch (error) {
      console.error('Error updating product image:', error)
      return {
        success: false,
        error: 'Failed to update image'
      }
    }
  }

  // Delete product image
  static async deleteProductImage(productId: string, imageId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/${productId}/images/${imageId}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to delete image'
        }
      }
      
      return {
        success: true,
        data: true
      }
    } catch (error) {
      console.error('Error deleting product image:', error)
      return {
        success: false,
        error: 'Failed to delete image'
      }
    }
  }

  // Utility methods
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  static getConditionLabel(condition: Product['condition']): string {
    const labels = {
      new: 'New',
      used: 'Used',
      refurbished: 'Refurbished'
    }
    return labels[condition] || condition
  }

  static getConditionColor(condition: Product['condition']): string {
    const colors = {
      new: 'text-green-600',
      used: 'text-yellow-600',
      refurbished: 'text-blue-600'
    }
    return colors[condition] || 'text-gray-600'
  }

  static isInStock(product: Product): boolean {
    return product.is_active && product.quantity > 0
  }

  static getPrimaryImage(product: Product): ProductImage | null {
    if (!product.images || product.images.length === 0) {
      return null
    }
    
    const primaryImage = product.images.find(img => img.is_primary)
    return primaryImage || product.images[0]
  }

  static getImageUrl(image: ProductImage | null): string {
    if (!image) {
      return '/images/placeholder-product.jpg' // You'll need to add this placeholder
    }
    return image.url
  }
}