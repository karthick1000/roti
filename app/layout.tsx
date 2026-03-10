import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "Roti - Minimal Expense Tracker | Just Log and Move On",
  description: "A simple, minimal expense tracker for daily spending. Track expenses with tags, view analytics, and manage your budget. Free personal finance app - like the khata in your neighborhood kirana shop.",
  keywords: ["expense tracker", "budget app", "personal finance", "spending tracker", "money manager", "daily expenses", "finance app"],
  authors: [{ name: "Roti" }],
  creator: "Roti",
  publisher: "Roti",
  robots: "index, follow",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Roti - Expense Tracker",
  },
  openGraph: {
    title: "Roti - Minimal Expense Tracker",
    description: "Track your daily expenses simply. No signup, no fuss - just log and move on.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Roti - Minimal Expense Tracker",
    description: "Track your daily expenses simply. No signup, no fuss - just log and move on.",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
