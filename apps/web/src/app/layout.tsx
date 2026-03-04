import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MagicLinkKit — Passwordless Auth as a Service",
  description:
    "Drop-in magic link and OTP authentication API for indie developers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
