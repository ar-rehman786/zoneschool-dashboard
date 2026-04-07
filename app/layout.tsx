import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZoneSchool | Market Intelligence Dashboard',
  description: 'Zone Technique — Lead Analysis & Strategic Insights for Dr. Peter Goldman',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Lexend:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
