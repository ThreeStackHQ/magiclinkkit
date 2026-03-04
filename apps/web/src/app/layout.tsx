import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "MagicLinkKit — Passwordless Auth as a Service",
    template: "%s | MagicLinkKit",
  },
  description:
    "Drop-in magic link and OTP authentication API for modern apps. Passwordless auth in 5 minutes.",
  keywords: [
    "magic links",
    "OTP",
    "passwordless authentication",
    "auth API",
    "email authentication",
    "two-factor authentication",
  ],
  authors: [{ name: "MagicLinkKit" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "MagicLinkKit",
    title: "MagicLinkKit — Passwordless Auth as a Service",
    description:
      "Drop-in magic link and OTP authentication API for modern apps. Passwordless auth in 5 minutes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MagicLinkKit — Passwordless Auth as a Service",
    description:
      "Drop-in magic link and OTP authentication API for modern apps. Passwordless auth in 5 minutes.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}
