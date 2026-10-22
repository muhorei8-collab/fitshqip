import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'FITSHQIP — Stërvitu. Ndiq progresin. Bëhu më i fortë.',
  description:
    'FITSHQIP është aplikacioni shqiptar i fitnesit: regjistro stërvitjet, ndiq progresin, thyej rekorde dhe bëhu më i fortë.',
  generator: 'v0.app',
  applicationName: 'FITSHQIP',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FITSHQIP',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: '#0a0a0b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

// Zbaton temën e ruajtur para se faqja të pikturohet (pa pulsim të errët → të çelët).
const THEME_SCRIPT = `(function(){try{if(localStorage.getItem('fitshqip-theme')==='light'){document.documentElement.setAttribute('data-theme','light');var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#f6f6f7');}}catch(e){}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sq" suppressHydrationWarning className={`bg-background ${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
