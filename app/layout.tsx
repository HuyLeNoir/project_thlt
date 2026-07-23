import { Inter, K2D } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"

import "./globals.css"
import { cn } from "@/lib/utils"
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const k2d = K2D({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-k2d",
})
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", "font-sans", inter.variable, k2d.variable)}
    >
      <TooltipProvider>
        <body>
          <div>{children}</div>
        </body>
      </TooltipProvider>
    </html>
  )
}
