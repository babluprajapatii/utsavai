import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteUrl, SITE_CONFIG } from "@/lib/site-config";
import { getStructuredData } from "@/lib/structured-data";

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "UtsavAI - Plan your entire celebration in one place",
    template: "%s - UtsavAI",
  },
  description:
    "UtsavAI is an intelligent event and celebration planning platform. Manage budgets, tasks, timelines, vendors, and guests for weddings, birthdays, community events, and family celebrations.",
  keywords: [
    "UtsavAI",
    "event planning",
    "celebration planning",
    "wedding planner",
    "birthday planner",
    "AI event planning",
    "budget manager",
    "vendor management",
  ],
  authors: [{ name: "UtsavAI" }],
  creator: "UtsavAI",
  publisher: "UtsavAI",
  applicationName: "UtsavAI",
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "UtsavAI - Plan your entire celebration in one place",
    description:
      "Plan weddings, birthdays, community events, and family celebrations in one organized workspace. Budget, tasks, timeline, vendors, guests, and AI recommendations.",
    url: SITE_URL,
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.locale,
    type: "website",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "UtsavAI - Plan beautiful celebrations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UtsavAI - Plan your entire celebration in one place",
    description:
      "Plan weddings, birthdays, community events, and family celebrations in one organized workspace.",
    images: ["/brand/og-image.png"],
    creator: "@utsavai",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1814" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = getStructuredData();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="antialiased bg-background text-foreground font-sans">
        <ThemeProvider>
          {children}
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
