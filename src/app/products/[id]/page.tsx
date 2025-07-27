'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ProductDetail } from '@/components/products'
import { Product } from '@/types'
import { getMockProductImage } from '@/utils/mockImages'

// Function to generate all mock products (similar to useProductSearch)
function generateMockProducts(): Product[] {
  const mockProductNames = [
    'Fren Balata Takımı',
    'Motor Yağı Filtresi',
    'Amortisör Takımı',
    'Debriyaj Disk Takımı',
    'Fren Diski',
    'Hava Filtresi',
    'Akü',
    'Lastik',
    'Xenon Ampul',
    'Radyatör',
    'Termostat',
    'Su Pompası',
    'Alternatör',
    'Marş Motoru',
    'Yakıt Pompası',
    'Egzoz Susturucu',
    'Amortisör Yatak',
    'Rot Başı',
    'Alt Takım',
    'Üst Takım'
  ]

  const mockCarMakes = ['BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford', 'Opel', 'Renault', 'Peugeot']
  const mockCarModels = ['320i', 'C200', 'A4', 'Golf', 'Focus', 'Astra', 'Megane', '308']
  const mockCategories = ['brake-system', 'engine-parts', 'transmission', 'suspension', 'electrical', 'filters']
  const mockConditions = ['new', 'used', 'refurbished'] as const
  
  return Array.from({ length: 200 }, (_, i) => {
    const productId = `product-${i + 1}`
    const nameIndex = i
    const originalPrice = Math.random() > 0.7 ? (100 + (i * 50) + Math.random() * 200) : undefined
    const price = originalPrice ? originalPrice * 0.8 : (50 + (i * 30) + Math.random() * 150)
    const categoryIndex = i % mockCategories.length
    const makeIndex = i % mockCarMakes.length
    
    return {
      id: productId,
      sku: `PRÇ-${String(i + 1).padStart(4, '0')}`,
      name: mockProductNames[nameIndex % mockProductNames.length],
      description: 'Yüksek kaliteli otomotiv yedek parçası. Orijinal kalitede ve garantili.',
      category_id: mockCategories[categoryIndex],
      make: mockCarMakes[makeIndex],
      model: mockCarModels[i % mockCarModels.length],
      year: 2015 + (i % 10),
      part_number: `PN-${String(i + 1).padStart(6, '0')}`,
      condition: mockConditions[i % mockConditions.length],
      price: Number(price.toFixed(2)),
      original_price: originalPrice ? Number(originalPrice.toFixed(2)) : undefined,
      quantity: Math.floor(Math.random() * 50) + 1,
      weight: Number((Math.random() * 10 + 0.5).toFixed(1)),
      dimensions: JSON.stringify({
        length: Math.floor(Math.random() * 50) + 10,
        width: Math.floor(Math.random() * 30) + 5,
        height: Math.floor(Math.random() * 20) + 2
      }),
      specifications: JSON.stringify({
        brand: 'OEM Kalite',
        warranty: '2 yıl garanti',
        material: 'Yüksek kaliteli malzeme',
        origin: 'Türkiye',
        certification: 'CE, ISO'
      }),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: [
        {
          id: `img-${productId}`,
          product_id: productId,
          url: getMockProductImage(mockProductNames[nameIndex % mockProductNames.length]),
          alt_text: mockProductNames[nameIndex % mockProductNames.length],
          is_primary: true,
          order_index: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]
    }
  })
}

export default function ProductDetailPage() {
  const params = useParams()
  console.log('ProductDetailPage params:', params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        // Get all products and find the one with matching ID
        const allProducts = generateMockProducts()
        const foundProduct = allProducts.find((p: Product) => p.id === params.id)
        
        if (foundProduct) {
          setProduct(foundProduct)
        } else {
          setError('Product not found')
        }
      } catch (err) {
        setError('Error loading product')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-md"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Product Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <a
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Products
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a
                href="/"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Home
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <a
                  href="/products"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  Products
                </a>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Product Detail */}
        <ProductDetail product={product} />

        {/* Related Products Section (placeholder) */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Related Products
          </h2>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              Related products would be displayed here based on the current product's category and compatibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}