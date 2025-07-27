// Mock product images for development
export const MOCK_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop&crop=center&q=80', // brake parts
  'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=400&fit=crop&crop=center&q=80', // engine parts
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center&q=80', // car tools
  'https://images.unsplash.com/photo-1544967082-d9759e96d4e8?w=400&h=400&fit=crop&crop=center&q=80', // auto parts
  'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400&h=400&fit=crop&crop=center&q=80', // car maintenance
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop&crop=center&q=80', // automotive parts
  'https://images.unsplash.com/photo-1607603750916-2c4e25b4e2c9?w=400&h=400&fit=crop&crop=center&q=80', // car parts on table
  'https://images.unsplash.com/photo-1602810320073-1230c46d1d35?w=400&h=400&fit=crop&crop=center&q=80', // mechanic tools
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop&crop=center&q=80', // car engine
  'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&crop=center&q=80', // automotive service
]

// Function to get a random image for a product
export function getMockProductImage(productId?: string): string {
  if (!productId) {
    return MOCK_PRODUCT_IMAGES[0]
  }
  
  // Use product ID to consistently get the same image for the same product
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const index = hash % MOCK_PRODUCT_IMAGES.length
  return MOCK_PRODUCT_IMAGES[index]
}
