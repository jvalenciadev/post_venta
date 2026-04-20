import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mote y Chuño | Elite POS',
  description: 'Sistema de Punto de Venta Gastronómico - Mote y Chuño',
  manifest: '/manifest.json',
}

import AuthListener from '@/components/auth/AuthListener'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthListener />
        {children}
      </body>
    </html>
  )
}
