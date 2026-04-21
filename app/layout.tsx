import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title:       'DealerPro — Property Dealers CRM',
  description: 'Premium property management platform for real estate dealers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  )
}