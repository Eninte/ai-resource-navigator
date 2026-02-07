import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/privacy/CookieConsent";

// Import local fonts from @fontsource
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "@fontsource/geist/700.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/500.css";
// Import Montserrat for headings
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";

export const metadata: Metadata = {
  title: "AI资源导航 - 发现最佳AI工具",
  description: "探索全球顶尖AI资源，一站式发现你需要的AI工具。代码编程、图像处理、写作助手、办公工具等9大分类，助你提升效率。",
  keywords: ["AI工具", "AI资源", "AI导航", "人工智能", "ChatGPT", "Claude"],
  authors: [{ name: "AI资源导航" }],
  creator: "AI资源导航",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ai-nav.example.com"),
  openGraph: {
    title: "AI资源导航 - 发现最佳AI工具",
    description: "探索全球顶尖AI资源，一站式发现你需要的AI工具。代码编程、图像处理、写作助手、办公工具等9大分类，助你提升效率。",
    type: "website",
    locale: "zh_CN",
    siteName: "AI资源导航",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI资源导航 - 发现最佳AI工具",
    description: "探索全球顶尖AI资源，一站式发现你需要的AI工具",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  );
}
