import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TwoFAKit — 2FA as a Service",
  description: "Drop-in TOTP two-factor authentication API for indie SaaS",
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
