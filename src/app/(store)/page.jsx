import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/footer/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      
      <main className="flex-1 pt-28 md:pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full space-y-16 md:space-y-24 overflow-hidden">
        
        {/* Hero Skeleton */}
        <section className="w-full h-[250px] md:h-[600px] bg-neutral-200 rounded-[1.5rem] md:rounded-[2.5rem] animate-pulse flex items-center justify-center shadow-sm">
          <span className="text-neutral-400 font-[family-name:var(--font-syne)] text-xl md:text-3xl font-bold tracking-wide">
            Hero Section (Phase 6)
          </span>
        </section>

        {/* Trending Wear Skeleton */}
        <section>
          <div className="flex justify-between items-end mb-6 md:mb-10 border-b border-neutral-200 pb-4">
            <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-5xl font-bold tracking-tight">
              Trending Wear
            </h2>
            <button className="text-sm font-medium hover:opacity-70 transition-opacity flex items-center mb-1">
              View More <span className="ml-1 md:ml-2">→</span>
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2 md:px-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-neutral-200 rounded-xl md:rounded-2xl animate-pulse" />
            ))}
          </div>
        </section>

        {/* Women's Wear Skeleton */}
        <section>
          <div className="flex justify-between items-end mb-6 md:mb-10 border-b border-neutral-200 pb-4">
            <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-5xl font-bold tracking-tight">
              Women's Wear
            </h2>
            <button className="text-sm font-medium hover:opacity-70 transition-opacity flex items-center mb-1">
              View More <span className="ml-1 md:ml-2">→</span>
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2 md:px-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-neutral-200 rounded-xl md:rounded-2xl animate-pulse" />
            ))}
          </div>
        </section>

        {/* Kid's Wear Skeleton */}
        <section>
          <div className="flex justify-between items-end mb-6 md:mb-10 border-b border-neutral-200 pb-4">
            <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-5xl font-bold tracking-tight">
              Kid's Wear
            </h2>
            <button className="text-sm font-medium hover:opacity-70 transition-opacity flex items-center mb-1">
              View More <span className="ml-1 md:ml-2">→</span>
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2 md:px-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-neutral-200 rounded-xl md:rounded-2xl animate-pulse" />
            ))}
          </div>
        </section>

        {/* Men's Wear Skeleton */}
        <section>
          <div className="flex justify-between items-end mb-6 md:mb-10 border-b border-neutral-200 pb-4">
            <h2 className="font-[family-name:var(--font-syne)] text-3xl md:text-5xl font-bold tracking-tight">
              Men's Wear
            </h2>
            <button className="text-sm font-medium hover:opacity-70 transition-opacity flex items-center mb-1">
              View More <span className="ml-1 md:ml-2">→</span>
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2 md:px-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-neutral-200 rounded-xl md:rounded-2xl animate-pulse" />
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}