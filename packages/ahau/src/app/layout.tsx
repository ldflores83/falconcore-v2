import type { Metadata } from 'next'
import '../../styles/globals.css'

export const metadata: Metadata = {
  title: 'Ahau - El liderazgo, sincronizado',
  description: 'Alinea las voces de tu equipo directivo sin perder autenticidad.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-950 antialiased">{children}</body>
    </html>
  )
}


