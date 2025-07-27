'use client'

import React from 'react'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  highlight?: boolean
}

const Features: React.FC = () => {
  const features: Feature[] = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Garantili Kalite",
      description: "Tüm ürünlerimiz orijinal ve kaliteli malzemelerden üretilmiştir. Satış sonrası garanti desteği sağlıyoruz.",
      highlight: true
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Hızlı Teslimat",
      description: "24 saat içinde kargo, acil durumlar için aynı gün teslimat imkanı. Türkiye'nin her yerine güvenli kargo.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: "Uzman Destek",
      description: "Tecrübeli teknisyen ekibimiz, doğru parça seçimi ve montaj konularında size rehberlik eder.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: "Geniş Ürün Yelpazesi",
      description: "25.000'den fazla farklı yedek parça çeşidi. Tüm marka ve modeller için uyumlu parçalar.",
      highlight: true
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: "Uygun Fiyat",
      description: "Rekabetçi fiyatlar, toplu alımlarda özel indirimler. Kalite-fiyat dengesinde en uygun çözümler.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: "Kolay İade",
      description: "30 gün içinde koşulsuz iade garantisi. Montaj hatası veya uyumsuzluk durumunda ücretsiz değişim.",
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Neden <span className="text-gray-600">Bizi Tercih</span> Etmelisiniz?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            13 yıllık tecrübemiz ve müşteri memnuniyeti odaklı hizmet anlayışımızla 
            otomotiv sektörünün güvenilir çözüm ortağıyız.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-lg transition-all duration-300 hover:scale-105 ${
                feature.highlight
                  ? 'bg-white shadow-xl border-2 border-black hover:shadow-2xl'
                  : 'bg-white shadow-lg border border-gray-200 hover:shadow-xl'
              }`}
            >
              {/* Highlight Badge */}
              {feature.highlight && (
                <div className="absolute -top-3 left-8">
                  <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Öne Çıkan
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg mb-6 ${
                feature.highlight
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-black'
              }`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-black mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-black rounded-lg p-8 sm:p-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Hemen Başlayın
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Aracınız için ihtiyacınız olan yedek parçaları kolayca bulun ve 
              hızlı teslimatın keyfini çıkarın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors">
                Ürünleri İncele
              </button>
              <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-lg font-semibold transition-colors">
                İletişime Geç
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
