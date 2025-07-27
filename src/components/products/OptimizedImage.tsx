'use client'

import { useState } from 'react'
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}

export function OptimizedImage({
  src,
  alt,
  fill,
  width,
  height,
  className = '',
  sizes,
  priority = false,
  loading = 'lazy',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  objectFit = 'cover'
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Generate a simple blur placeholder if none provided
  const defaultBlurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="

  const handleLoad = () => {
    setImageLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setImageError(true)
    onError?.()
  }

  // Show placeholder image on error
  if (imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  const imageProps = {
    src,
    alt,
    className: `transition-opacity duration-300 ${
      imageLoaded ? 'opacity-100' : 'opacity-0'
    } ${className}`,
    onLoad: handleLoad,
    onError: handleError,
    priority,
    placeholder: placeholder as any,
    blurDataURL: blurDataURL || defaultBlurDataURL,
    style: objectFit !== 'cover' ? { objectFit } : undefined,
    ...(sizes && { sizes }),
    ...(loading && { loading })
  }

  if (fill) {
    return <Image {...imageProps} fill />
  }

  if (width && height) {
    return <Image {...imageProps} width={width} height={height} />
  }

  // Fallback with reasonable defaults
  return <Image {...imageProps} width={400} height={400} />
}

// Hook for generating optimized image URLs (useful for different CDNs)
export function useOptimizedImageUrl(url: string, width?: number, height?: number, quality?: number) {
  // This could be extended to work with image CDNs like Cloudinary, ImageKit, etc.
  if (!url) return ''
  
  // For now, return the original URL
  // In a real implementation, you might transform URLs for different CDNs
  return url
}

// Utility to generate blur data URL from image URL
export async function generateBlurDataURL(imageUrl: string): Promise<string> {
  try {
    // In a real implementation, you might use a service to generate blur placeholders
    // For now, return the default blur
    return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
  } catch (error) {
    return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
  }
}
