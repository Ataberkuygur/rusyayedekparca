'use client'

import React from 'react'
import Link from 'next/link'

const Hero: React.FC = () => {
  return (
    <section className="relative h-[50vh] fold:h-[45vh] sm:h-[60vh] md:h-[70vh] overflow-hidden">
      {/* Full Background Image */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/Adsız tasarım - 2025-07-27T121223.613.png')`,
          }}
        />
        {/* No overlay for 100% background visibility */}
      </div>

      {/* Main content - Balanced positioning */}
      <div className="relative z-20 h-[50vh] fold:h-[45vh] sm:h-[60vh] md:h-[70vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 fold:px-3 sm:px-6 lg:px-8 w-full">
          <div className="w-full lg:w-2/3 xl:w-1/2 space-y-3 fold:space-y-2 sm:space-y-6">
          
          {/* Main headline */}
          <div className="space-y-2 fold:space-y-1 sm:space-y-4">
            <h1 className="text-2xl fold:text-xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-none tracking-tight">
              <span className="block text-white" style={{textShadow: '4px 4px 8px rgba(0,0,0,0.8), 2px 2px 4px rgba(0,0,0,0.6)'}}>YEDEK</span>
              <span className="block text-white" style={{textShadow: '4px 4px 8px rgba(0,0,0,0.8), 2px 2px 4px rgba(0,0,0,0.6)'}}>PARÇA</span>
            </h1>
            <div className="flex">
              <div className="w-12 fold:w-10 sm:w-20 h-1 bg-white rounded-full shadow-lg" style={{boxShadow: '0 4px 8px rgba(0,0,0,0.5)'}}></div>
            </div>
            <p className="text-sm fold:text-xs sm:text-lg md:text-xl lg:text-2xl text-white font-light max-w-lg fold:max-w-xs sm:max-w-xl leading-relaxed" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.6)'}}>
              Güvenilir Otomotiv Çözümleri İçin Doğru Adres
            </p>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-3 gap-3 fold:gap-2 sm:gap-6 lg:gap-8 max-w-xs fold:max-w-xs sm:max-w-xl">
            <div className="text-left">
              <span className="block text-lg fold:text-base sm:text-2xl md:text-3xl lg:text-4xl font-black text-white" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.8)'}}>50K+</span>
              <span className="text-white text-[10px] fold:text-[9px] sm:text-xs md:text-sm font-medium" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>Orijinal Parça</span>
            </div>
            <div className="text-left">
              <span className="block text-lg fold:text-base sm:text-2xl md:text-3xl lg:text-4xl font-black text-white" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.8)'}}>24h</span>
              <span className="text-white text-[10px] fold:text-[9px] sm:text-xs md:text-sm font-medium" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>Hızlı Teslimat</span>
            </div>
            <div className="text-left">
              <span className="block text-lg fold:text-base sm:text-2xl md:text-3xl lg:text-4xl font-black text-white" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.8)'}}>7/24</span>
              <span className="text-white text-[10px] fold:text-[9px] sm:text-xs md:text-sm font-medium" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>Destek</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-2 fold:gap-1.5 sm:flex-row sm:gap-4 pt-2">
            <Link href="/products" className="w-full sm:w-auto px-4 fold:px-3 py-2.5 fold:py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 text-sm fold:text-xs inline-flex items-center justify-center group shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 active:scale-95 touch-manipulation">
              PARÇA BUL
              <svg className="w-3 h-3 fold:w-2.5 fold:h-2.5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/categories" className="w-full sm:w-auto px-4 fold:px-3 py-2.5 fold:py-2 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-black active:bg-gray-100 transition-all duration-300 text-sm fold:text-xs inline-flex items-center justify-center shadow-xl backdrop-blur-sm bg-white/10 hover:bg-white transform hover:-translate-y-1 active:scale-95 touch-manipulation">
              KATEGORİLER
            </Link>
          </div>
        </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-8 z-20">
        <div className="animate-bounce">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}

export default Hero
