import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title:       'DealerPro — Property Dealers CRM',
  description: 'Premium property management platform for real estate dealers in India',
  manifest:    '/manifest.json',
  appleWebApp: {
    capable:    true,
    statusBarStyle: 'default',
    title:      'DealerPro',
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor:       '#10b981',
  width:            'device-width',
  initialScale:     1,
  maximumScale:     1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  )
}