import { AuthProvider } from "@/providers/auth/AuthProvider";
import './globals.css'

export const metadata = {
  title: 'Clouder',
  description: 'Created with Clouder',
  generator: 'Clouder',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
