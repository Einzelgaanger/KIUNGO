import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex",
});

const SOCIAL_TITLE = "Kiungo — Verified delivery for Kenya housing";
const SOCIAL_DESCRIPTION =
  "Who supplied what, with GPS and photo evidence. Settlement follows the work — not a form.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SOCIAL_TITLE,
    template: "%s | Kiungo",
  },
  description: SOCIAL_DESCRIPTION,
  applicationName: "Kiungo",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Kiungo",
    locale: "en_KE",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Kiungo — verified delivery for Kenya housing and construction",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    images: ["/twitter-image"],
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E1F1A",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} ${space.variable} ${inter.variable} ${plex.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
