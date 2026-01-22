import type { Metadata } from "next";
import { Chakra_Petch, Inter } from "next/font/google";
import "./globals.css";
import { QueryClientProviderWrapper } from "@/components/providers/query-client-provider";
import ErrorBoundary from "@/components/error-boundary";
import { Analytics } from "@vercel/analytics/next";

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Here We Go Transfers",
  description:
    "Dark-mode-first football transfer analytics dashboard for the soft launch MVP. Real-time transfers, market pulse analytics, and insider signals.",
  openGraph: {
    title: "Here We Go Transfers",
    description: "Pure transfer intel. Zero noise. Real-time football transfer analytics dashboard.",
    type: "website",
    locale: "en_US",
    url: "https://transferhub.io",
  },
  twitter: {
    card: "summary_large_image",
    title: "Here We Go Transfers",
    description: "Pure transfer intel. Zero noise. Real-time football transfer analytics dashboard.",
  },
  keywords: ["football transfers", "soccer transfers", "transfer market", "deadline day", "football analytics"],
  authors: [{ name: "Transfer Hub Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-background text-foreground">
      <body className={`${chakraPetch.variable} ${inter.variable} antialiased`}>
        <QueryClientProviderWrapper>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </QueryClientProviderWrapper>
        <Analytics />
      </body>
    </html>
  );
}
