import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guitar Chord Finder',
  description: 'Find and learn guitar chords',
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