'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const pathname = usePathname()

  // Generate breadcrumb items from pathname if not provided
  const breadcrumbItems = items || generateBreadcrumbItems(pathname)

  if (breadcrumbItems.length <= 1) {
    return null
  }

  return (
    <nav 
      className={`flex ${className}`} 
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-6 h-6 text-gray-400 mx-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            
            {item.href && index < breadcrumbItems.length - 1 ? (
              <Link
                href={item.href}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {index === 0 && (
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                )}
                {item.label}
              </Link>
            ) : (
              <span className="inline-flex items-center text-sm font-medium text-gray-500">
                {index === 0 && (
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                )}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'Ana Sayfa', href: '/' }
  ]

  if (pathname === '/') {
    return [{ label: 'Ana Sayfa' }]
  }

  const pathParts = pathname.split('/').filter(Boolean)
  
  // Build breadcrumb based on URL structure
  let currentPath = ''
  
  for (let i = 0; i < pathParts.length; i++) {
    currentPath += `/${pathParts[i]}`
    const isLast = i === pathParts.length - 1
    
    let label = pathParts[i]
    
    // Convert common URL segments to Turkish labels
    switch (pathParts[i]) {
      case 'products':
        label = 'Ürünler'
        break
      case 'categories':
        label = 'Kategoriler'
        break
      case 'brands':
        label = 'Markalar'
        break
      case 'cart':
        label = 'Sepet'
        break
      case 'checkout':
        label = 'Ödeme'
        break
      case 'account':
        label = 'Hesabım'
        break
      case 'orders':
        label = 'Siparişlerim'
        break
      case 'addresses':
        label = 'Adreslerim'
        break
      case 'profile':
        label = 'Profil'
        break
      case 'admin':
        label = 'Admin Panel'
        break
      case 'inventory':
        label = 'Envanter'
        break
      case 'users':
        label = 'Kullanıcılar'
        break
      case 'reports':
        label = 'Raporlar'
        break
      case 'auth':
        label = 'Giriş'
        break
      case 'login':
        label = 'Giriş Yap'
        break
      case 'register':
        label = 'Kayıt Ol'
        break
      case 'forgot-password':
        label = 'Şifre Sıfırla'
        break
      case 'contact':
        label = 'İletişim'
        break
      case 'about':
        label = 'Hakkımızda'
        break
      case 'help':
        label = 'Yardım'
        break
      case 'privacy':
        label = 'Gizlilik Politikası'
        break
      case 'terms':
        label = 'Kullanım Şartları'
        break
      default:
        // Capitalize first letter and handle dashes/underscores
        label = label
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
    }
    
    items.push({
      label,
      href: isLast ? undefined : currentPath
    })
  }

  return items
}

export default Breadcrumb
