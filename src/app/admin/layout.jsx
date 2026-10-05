export const metadata = {
  title: 'Admin | Radha Outfit Collection',
  description: 'Radha Outfit Collection administration panel',
}

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {children}
    </div>
  )
}