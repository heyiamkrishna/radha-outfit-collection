'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import ShopFilters from './ShopFilters'
import { useSearchParams } from 'next/navigation'

export default function FilterDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category')

  return (
    <>
      {/* Mobile Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center justify-center gap-2 border border-neutral-200 rounded-full px-4 py-2 text-sm font-medium w-full hover:bg-neutral-50 transition-colors"
      >
        <Filter size={16} />
        Filters
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex md:hidden">
          
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Drawer Panel */}
          <div className="relative ml-auto w-4/5 max-w-sm bg-white h-full shadow-xl flex flex-col pt-6 px-6 animate-in slide-in-from-right">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
              <span className="font-[family-name:var(--font-syne)] text-xl font-bold">Filters</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-black transition-colors"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Filter Content */}
            <div className="overflow-y-auto flex-1 pb-6">
              <ShopFilters currentCategory={currentCategory} /> 
            </div>
            
            {/* Apply Button */}
            <div className="mt-auto py-6 border-t border-neutral-100 bg-white">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full bg-black text-white py-3.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                Apply Filters
              </button>
            </div>
            
          </div>
        </div>
      )}
    </>
  )
}