import { render, screen, fireEvent } from '@testing-library/react'
import { ProductImageGallery } from '../ProductImageGallery'
import { ProductImage } from '@/types'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, onClick, ...props }: any) => (
    <img src={src} alt={alt} onClick={onClick} {...props} />
  ),
}))

const mockImages: ProductImage[] = [
  {
    id: 'img-1',
    product_id: '1',
    url: '/image1.jpg',
    alt_text: 'Main product image',
    is_primary: true,
    order_index: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'img-2',
    product_id: '1',
    url: '/image2.jpg',
    alt_text: 'Side view',
    is_primary: false,
    order_index: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'img-3',
    product_id: '1',
    url: '/image3.jpg',
    alt_text: 'Detail view',
    is_primary: false,
    order_index: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

describe('ProductImageGallery', () => {
  it('renders main image correctly', () => {
    render(<ProductImageGallery images={mockImages} productName="Test Product" />)
    
    const mainImages = screen.getAllByAltText('Main product image')
    expect(mainImages[0]).toBeInTheDocument()
    expect(mainImages[0]).toHaveAttribute('src', '/image1.jpg')
  })

  it('renders thumbnail grid for multiple images', () => {
    render(<ProductImageGallery images={mockImages} productName="Test Product" />)
    
    // Should render all thumbnails - use getAllByAltText for multiple elements
    expect(screen.getAllByAltText('Main product image')).toHaveLength(2) // Main display + thumbnail
    expect(screen.getByAltText('Side view')).toBeInTheDocument()
    expect(screen.getByAltText('Detail view')).toBeInTheDocument()
  })

  it('shows primary badge on main image thumbnail', () => {
    render(<ProductImageGallery images={mockImages} productName="Test Product" />)
    
    expect(screen.getByText('Main')).toBeInTheDocument()
  })

  it('displays image counter', () => {
    render(<ProductImageGallery images={mockImages} productName="Test Product" />)
    
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('allows navigation between images using thumbnails', () => {
    render(<ProductImageGallery images={mockImages} productName="Test Product" />)
    
    // Click on second thumbnail
    const thumbnails = screen.getAllByRole('button')
    const secondThumbnail = thumbnails.find(btn => 
      btn.querySelector('img')?.getAttribute('src') === '/image2.jpg'
    )
    
    if (secondThumbnail) {
      fireEvent.click(secondThumbnail)
      expect(screen.getByText('2 / 3')).toBeInTheDocument()
    }
  })

  it('allows navigation using arrow buttons', () => {
    render(<ProductImageGallery images={mockImages} productName="Test Product" />)
    
    const nextButton = screen.getByLabelText('Next image')
    fireEvent.click(nextButton)
    
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('wraps around when navigating past last image', () => {
    render(<ProductImageGallery images={mockImages} productName="Test Product" />)
    
    const nextButton = screen.getByLabelText('Next image')
    
    // Click next twice to get to last image
    fireEvent.click(nextButton)
    fireEvent.click(nextButton)
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
    
    // Click next again to wrap to first image
    fireEvent.click(nextButton)
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('wraps around when navigating before first image', () => {
    render(<ProductImageGallery images={mockImages} productName="Test Product" />)
    
    const prevButton = screen.getByLabelText('Previous image')
    fireEvent.click(prevButton)
    
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
  })

  it('toggles zoom on main image click', () => {
    render(<ProductImageGallery images={mockImages} productName="Test Product" />)
    
    const mainImages = screen.getAllByAltText('Main product image')
    const mainImage = mainImages[0] // Get the first one (main display image)
    
    // Initially should show zoom in hint
    expect(screen.getByText('Click image to zoom in')).toBeInTheDocument()
    
    // Click to zoom in
    fireEvent.click(mainImage)
    expect(screen.getByText('Click image to zoom out')).toBeInTheDocument()
    
    // Click to zoom out
    fireEvent.click(mainImage)
    expect(screen.getByText('Click image to zoom in')).toBeInTheDocument()
  })

  it('renders placeholder when no images provided', () => {
    render(<ProductImageGallery images={[]} productName="Test Product" />)
    
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('does not show navigation controls for single image', () => {
    const singleImage = [mockImages[0]]
    render(<ProductImageGallery images={singleImage} productName="Test Product" />)
    
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument()
    expect(screen.queryByText('1 / 1')).not.toBeInTheDocument()
  })

  it('sorts images correctly with primary first', () => {
    // Create images with primary not first in array
    const unsortedImages = [
      { ...mockImages[1] }, // non-primary
      { ...mockImages[0] }, // primary
      { ...mockImages[2] }, // non-primary
    ]
    
    render(<ProductImageGallery images={unsortedImages} productName="Test Product" />)
    
    // Primary image should be displayed first in the main display
    const mainImages = screen.getAllByAltText('Main product image')
    expect(mainImages[0]).toHaveAttribute('src', '/image1.jpg')
  })

  it('applies custom className', () => {
    const { container } = render(
      <ProductImageGallery 
        images={mockImages} 
        productName="Test Product" 
        className="custom-class" 
      />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })
})