import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import GoogleTagManager, { GoogleTagManagerNoScript } from "@/components/GoogleTagManager";
import GoogleSearchConsole from "@/components/GoogleSearchConsole";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "800"],
  display: "swap",
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "AI Website Grader - Search Influence",
  description: "Analyze your website's readiness for AI-powered search engines, chat interfaces, and modern search algorithms. Get comprehensive insights and actionable recommendations.",
  keywords: "AI SEO, website analysis, search optimization, content analysis, AI search, chatbot optimization, Search Influence",
  authors: [{ name: "Search Influence" }],
  creator: "Search Influence",
  publisher: "Search Influence",
  robots: "index, follow",
  verification: {
    google: process.env.GOOGLE_SEARCH_CONSOLE_VERIFICATION || '',
  },
  openGraph: {
    title: "AI Website Grader - Search Influence",
    description: "Analyze your website's readiness for AI-powered search engines",
    type: "website",
    url: "https://ai-grader.searchinfluence.com",
    siteName: "Search Influence",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Website Grader - Search Influence",
    description: "Analyze your website's readiness for AI-powered search engines",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head suppressHydrationWarning>
        {/* Google Tag Manager */}
        <GoogleTagManager />
      </head>
      <body className={`${openSans.variable} antialiased`}>
        {/* GTM noscript fallback */}
        <GoogleTagManagerNoScript />

        {/* Google Search Console */}
        <GoogleSearchConsole verificationCode={process.env.GOOGLE_SEARCH_CONSOLE_VERIFICATION} />

        {children}
      </body>
    </html>
  );
}
