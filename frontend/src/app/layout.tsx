import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://utsavai.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "UtsavAI - Plan your entire celebration in one place",
    template: "%s - UtsavAI",
  },
  description:
    "UtsavAI is an event and celebration planning platform. Manage budget, tasks, timeline, vendors, and guests for weddings, birthdays, community events, and family celebrations.",
  keywords: [
    "UtsavAI",
    "event planning",
    "celebration planning",
    "wedding planner",
    "birthday planner",
    "AI event planning",
  ],
  authors: [{ name: "UtsavAI" }],
  applicationName: "UtsavAI",
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
    siteName: "UtsavAI",
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
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1814" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
