import { render, screen } from '@testing-library/react'
import { ProductGrid } from '../ProductGrid'
import { Product } from '@/types'

// Mock ProductCard component
jest.mock('../ProductCard', () => ({
  ProductCard: ({ product }: { product: Product }) => (
    <div data-testid={`product-card-${product.id}`}>
      {product.name}
    </div>
  ),
}))

const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'TEST-001',
    name: 'Test Product 1',
    description: 'Test description 1',
    category_id: 'cat-1',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    condition: 'new',
    price: 89.99,
    quantity: 5,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    sku: 'TEST-002',
    name: 'Test Product 2',
    description: 'Test description 2',
    category_id: 'cat-1',
    make: 'Honda',
    model: 'Civic',
    year: 2019,
    condition: 'used',
    price: 59.99,
    quantity: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

describe('ProductGrid', () => {
  it('renders products correctly', () => {
    render(<ProductGrid products={mockProducts} />)
    
    expect(screen.getByTestId('product-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('product-card-2')).toBeInTheDocument()
    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    expect(screen.getByText('Test Product 2')).toBeInTheDocument()
  })

  it('displays loading skeletons when loading is true', () => {
    render(<ProductGrid products={[]} loading={true} />)
    
    // Should render 8 skeleton cards
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(8)
  })

  it('shows empty state when no products are provided', () => {
    render(<ProductGrid products={[]} />)
    
    expect(screen.getByText('No products found')).toBeInTheDocument()
    expect(screen.getByText(/We couldn't find any products matching your criteria/)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ProductGrid products={mockProducts} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders correct grid layout classes', () => {
    const { container } = render(<ProductGrid products={mockProducts} />)
    
    expect(container.firstChild).toHaveClass(
      'grid',
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-3',
      'xl:grid-cols-4',
      'gap-6'
    )
  })

  it('renders empty state with SVG icon', () => {
    render(<ProductGrid products={[]} />)
    
    expect(document.querySelector('svg')).toBeInTheDocument()
  })
})