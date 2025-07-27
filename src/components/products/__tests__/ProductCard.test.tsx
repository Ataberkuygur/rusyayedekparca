import { render, screen } from '@testing-library/react'
import { ProductCard } from '../ProductCard'
import { Product } from '@/types'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}))

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}))

const mockProduct: Product = {
  id: '1',
  sku: 'TEST-001',
  name: 'Test Brake Pad Set',
  description: 'High-quality brake pads for your vehicle',
  category_id: 'cat-1',
  make: 'Toyota',
  model: 'Camry',
  year: 2020,
  part_number: 'BP-001',
  condition: 'new',
  price: 89.99,
  original_price: 109.99,
  quantity: 5,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  images: [
    {
      id: 'img-1',
      product_id: '1',
      url: '/test-image.jpg',
      alt_text: 'Test brake pad',
      is_primary: true,
      order_index: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
  ]
}

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Test Brake Pad Set')).toBeInTheDocument()
    expect(screen.getByText('2020 Toyota Camry')).toBeInTheDocument()
    expect(screen.getByText('Part #: BP-001')).toBeInTheDocument()
    expect(screen.getByText('$89.99')).toBeInTheDocument()
    expect(screen.getByText('$109.99')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('displays discount percentage when original price is higher', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('-18%')).toBeInTheDocument()
  })

  it('shows stock status correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Only 5 left')).toBeInTheDocument()
  })

  it('displays out of stock when quantity is 0', () => {
    const outOfStockProduct = { ...mockProduct, quantity: 0 }
    render(<ProductCard product={outOfStockProduct} />)
    
    expect(screen.getAllByText('Out of Stock')).toHaveLength(2) // Overlay + status
  })

  it('shows placeholder when no images are available', () => {
    const productWithoutImages = { ...mockProduct, images: [] }
    render(<ProductCard product={productWithoutImages} />)
    
    // Should render SVG placeholder
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders correct condition badge colors', () => {
    const usedProduct = { ...mockProduct, condition: 'used' as const }
    render(<ProductCard product={usedProduct} />)
    
    const conditionBadge = screen.getByText('Used')
    expect(conditionBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  it('creates correct product link', () => {
    render(<ProductCard product={mockProduct} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/products/1')
  })

  it('displays in stock status for products with sufficient quantity', () => {
    const inStockProduct = { ...mockProduct, quantity: 10 }
    render(<ProductCard product={inStockProduct} />)
    
    expect(screen.getByText('In Stock')).toBeInTheDocument()
  })
})