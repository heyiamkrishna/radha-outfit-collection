import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white pt-16 pb-8 mt-auto rounded-t-3xl mx-2">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-neutral-800 pb-12">
        
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-syne)] text-3xl tracking-wide font-bold">RADHA</span>
            <span className="text-[10px] tracking-widest uppercase text-neutral-400">Outfit Collection</span>
          </div>
          <p className="text-sm text-neutral-400">Contemporary Streetwear & Heavyweight Apparel</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-medium mb-6 font-[family-name:var(--font-syne)]">Quick Links</h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/shop" className="hover:text-white transition-colors">Collection</Link></li>
            <li><Link href="/feedback" className="hover:text-white transition-colors">Feedback</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="font-medium mb-6 font-[family-name:var(--font-syne)]">Customer Care</h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
            <li><Link href="/returns" className="hover:text-white transition-colors">Return & Refund</Link></li>
            <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Newsletter & Socials */}
        <div>
          <h4 className="font-medium mb-6 font-[family-name:var(--font-syne)]">Follow Us</h4>
          <div className="flex space-x-4 mb-8">
            {/* Instagram SVG */}
            <a href="#" aria-label="Instagram" className="text-neutral-400 hover:text-white cursor-pointer transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            {/* YouTube SVG */}
            <a href="#" aria-label="YouTube" className="text-neutral-400 hover:text-white cursor-pointer transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.1C2.5 7.1 2.3 5.4 3.1 4.6 4.1 3.5 5.3 3.5 5.9 3.4 8.6 3.2 12 3.2 12 3.2s3.4 0 6.1.2c.6.1 1.8.1 2.8 1.2.8.8 1 2.5 1 2.5s.2 2.1.2 4.2v1.8c0 2.1-.2 4.2-.2 4.2s-.2 1.7-1 2.5c-1 1.1-2.4 1-2.9 1.2-3 .3-6 .3-6 .3s-3.4 0-6.1-.2c-.6-.1-1.8-.1-2.8-1.2-.8-.8-1-2.5-1-2.5S2 13.1 2 11V9.2c0-2.1.2-4.2.2-4.2z"/><path d="M9.7 15.5l6-3.8-6-3.7v7.5z"/></svg>
            </a>
            {/* Twitter/X SVG */}
            <a href="#" aria-label="Twitter" className="text-neutral-400 hover:text-white cursor-pointer transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            {/* Facebook SVG */}
            <a href="#" aria-label="Facebook" className="text-neutral-400 hover:text-white cursor-pointer transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
          <p className="text-sm text-neutral-400 mb-4">Get exclusive offers & updates</p>
          <div className="relative">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full bg-transparent border border-neutral-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-white transition-colors"
            />
            <button className="absolute right-1 top-1 bottom-1 bg-white text-black p-2 rounded-full hover:bg-neutral-200 transition-colors">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500">
        <p>© 2026 Radha Outfit Collection. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  )
}