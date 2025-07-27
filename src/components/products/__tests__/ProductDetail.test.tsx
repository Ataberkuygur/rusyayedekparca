import { render, screen, fireEvent } from '@testing-library/react'
import { ProductDetail } from '../ProductDetail'
import { Product } from '@/types'

// Mock ProductImageGallery component
jest.mock('../ProductImageGallery', () => ({
  ProductImageGallery: ({ images, productName }: any) => (
    <div data-testid="product-image-gallery">
      Gallery for {productName} with {images.length} images
    </div>
  ),
}))

const mockProduct: Product = {
  id: '1',
  sku: 'TEST-001',
  name: 'Test Brake Pad Set',
  description: 'High-quality brake pads for your vehicle with excellent stopping power.',
  category_id: 'cat-1',
  make: 'Toyota',
  model: 'Camry',
  year: 2020,
  part_number: 'BP-001',
  condition: 'new',
  price: 89.99,
  original_price: 109.99,
  quantity: 5,
  weight: 2.5,
  dimensions: JSON.stringify({ length: 10, width: 8, height: 2 }),
  specifications: JSON.stringify({
    material: 'Ceramic',
    warranty: '2 years',
    brand: 'Premium Parts'
  }),
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
  ],
  compatibility: [
    {
      id: 'comp-1',
      product_id: '1',
      make: 'Toyota',
      model: 'Camry',
      year_start: 2018,
      year_end: 2022,
      engine: '2.5L I4',
      trim: 'LE',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
  ]
}

describe('ProductDetail', () => {
  it('renders product information correctly', () => {
    render(<ProductDetail product={mockProduct} />)
    
    expect(screen.getByText('Test Brake Pad Set')).toBeInTheDocument()
    expect(screen.getByText('2020 Toyota Camry')).toBeInTheDocument()
    expect(screen.getByText('Part Number: BP-001')).toBeInTheDocument()
    expect(screen.getByText('SKU: TEST-001')).toBeInTheDocument()
    expect(screen.getByText('$89.99')).toBeInTheDocument()
    expect(screen.getByText('$109.99')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('displays product description', () => {
    render(<ProductDetail product={mockProduct} />)
    
    expect(screen.getByText('High-quality brake pads for your vehicle with excellent stopping power.')).toBeInTheDocument()
  })

  it('shows discount badge and percentage', () => {
    render(<ProductDetail product={mockProduct} />)
    
    expect(screen.getByText('-18% OFF')).toBeInTheDocument()
  })

  it('displays stock status correctly', () => {
    render(<ProductDetail product={mockProduct} />)
    
    expect(screen.getByText('Only 5 left in stock')).toBeInTheDocument()
  })

  it('renders add to cart section when in stock', () => {
    render(<ProductDetail product={mockProduct} />)
    
    expect(screen.getByText('Quantity:')).toBeInTheDocument()
    expect(screen.getByText('Add to Cart')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
  })

  it('does not render add to cart when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, quantity: 0 }
    render(<ProductDetail product={outOfStockProduct} />)
    
    expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument()
    expect(screen.queryByText('Quantity:')).not.toBeInTheDocument()
  })

  it('allows quantity selection', () => {
    render(<ProductDetail product={mockProduct} />)
    
    const quantitySelect = screen.getByDisplayValue('1')
    fireEvent.change(quantitySelect, { target: { value: '3' } })
    
    expect(quantitySelect).toHaveValue('3')
  })

  it('displays vehicle compatibility information', () => {
    render(<ProductDetail product={mockProduct} />)
    
    expect(screen.getByText('Vehicle Compatibility')).toBeInTheDocument()
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument()
    expect(screen.getByText(/2018 - 2022/)).toBeInTheDocument()
    expect(screen.getByText(/2.5L I4/)).toBeInTheDocument()
    expect(screen.getByText(/LE/)).toBeInTheDocument()
  })

  it('displays specifications', () => {
    render(<ProductDetail product={mockProduct} />)
    
    expect(screen.getByText('Specifications')).toBeInTheDocument()
    expect(screen.getByText(/material/i)).toBeInTheDocument()
    expect(screen.getByText('Ceramic')).toBeInTheDocument()
    expect(screen.getByText(/warranty/i)).toBeInTheDocument()
    expect(screen.getByText('2 years')).toBeInTheDocument()
  })

  it('displays physical details', () => {
    render(<ProductDetail product={mockProduct} />)
    
    expect(screen.getByText('Physical Details')).toBeInTheDocument()
    expect(screen.getByText('Dimensions')).toBeInTheDocument()
    expect(screen.getByText('10" × 8" × 2"')).toBeInTheDocument()
    expect(screen.getByText('Weight')).toBeInTheDocument()
    expect(screen.getByText('2.5 lbs')).toBeInTheDocument()
  })

  it('renders image gallery', () => {
    render(<ProductDetail product={mockProduct} />)
    
    expect(screen.getByTestId('product-image-gallery')).toBeInTheDocument()
    expect(screen.getByText('Gallery for Test Brake Pad Set with 1 images')).toBeInTheDocument()
  })

  it('handles products without optional fields', () => {
    const minimalProduct = {
      ...mockProduct,
      part_number: undefined,
      original_price: undefined,
      weight: undefined,
      dimensions: undefined,
      specifications: undefined,
      compatibility: undefined,
    }
    
    render(<ProductDetail product={minimalProduct} />)
    
    expect(screen.getByText('Test Brake Pad Set')).toBeInTheDocument()
    expect(screen.queryByText('Part Number:')).not.toBeInTheDocument()
    expect(screen.queryByText('$109.99')).not.toBeInTheDocument()
    expect(screen.queryByText('Vehicle Compatibility')).not.toBeInTheDocument()
    expect(screen.queryByText('Specifications')).not.toBeInTheDocument()
    expect(screen.queryByText('Physical Details')).not.toBeInTheDocument()
  })
})