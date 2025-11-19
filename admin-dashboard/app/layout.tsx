import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ride Hailing Admin Dashboard',
  description: 'Manage your ride-hailing platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
