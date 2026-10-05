import { Syne, Space_Grotesk } from 'next/font/google'
import './globals.css'
import CartDrawer from '@/components/cart/CartDrawer'

const syne = Syne({ 
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata = {
  title: 'Radha Outfit Collection | Premium Streetwear',
  description: 'Contemporary streetwear and heavyweight apparel designed for the modern you.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceGrotesk.variable}`}>
     <body className="min-h-screen flex flex-col font-[family-name:var(--font-space-grotesk)] text-[var(--foreground)] antialiased">
        {children}
       
        <CartDrawer />
      </body>
    </html>
  )
}