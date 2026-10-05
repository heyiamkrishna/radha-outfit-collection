'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductGallery({ images = [], productName }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Fallback if no images exist
  const gallery = images.length > 0 ? images : [{ image_url: '/images/placeholders/product.jpg' }]

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % gallery.length)
  const prevImage = () => setCurrentIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible no-scrollbar">
        {gallery.map((img, idx) => (
          <button
            key={img.id || idx}
            onClick={() => setCurrentIndex(idx)}
            className={`shrink-0 w-20 h-24 md:w-24 md:h-28 rounded-xl overflow-hidden border-2 transition-colors ${
              currentIndex === idx ? 'border-black' : 'border-transparent hover:border-neutral-200'
            }`}
          >
            <img src={img.image_url} alt={`${productName} thumbnail`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 aspect-[4/5] bg-neutral-100 rounded-[2rem] overflow-hidden group">
        <img 
          src={gallery[currentIndex].image_url} 
          alt={productName} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        
        {gallery.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center text-black hover:bg-white transition-colors shadow-sm hidden md:flex">
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center text-black hover:bg-white transition-colors shadow-sm hidden md:flex">
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}