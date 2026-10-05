'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function ProtectedAdminLayout({
  children,
}) {
  const [mobileOpen, setMobileOpen] =
    useState(false)

  return (
    <div className="min-h-screen bg-[#f7f7f5]">

      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
      />

      <div className="min-h-screen lg:pl-[260px]">

        <AdminHeader
          onMenuClick={() =>
            setMobileOpen(true)
          }
        />

        <main className="min-h-[calc(100vh-72px)]">
          {children}
        </main>

      </div>

    </div>
  )
}