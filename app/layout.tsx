import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#11110f",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: "هوکا — آیین شب، از نو",
    description: "منوی دیجیتال هوکا در فرمونتی؛ چهار سرو، یک شب آرام.",
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
    },
    openGraph: {
      title: "هوکا — آیین شب، از نو",
      description: "منوی دیجیتال هوکا در فرمونتی؛ چهار سرو، یک شب آرام.",
      type: "website",
      locale: "fa_IR",
      url: origin,
      siteName: "هوکا",
      images: [{ url: `${origin}/og.jpg`, width: 1732, height: 908, alt: "هوکا — آیین شب، از نو" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "هوکا — آیین شب، از نو",
      description: "منوی دیجیتال هوکا در فرمونتی · چهار سرو، یک شب آرام.",
      images: [`${origin}/og.jpg`],
    },
  };
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "هوکا — فرمونتی",
  description: "منوی دیجیتال قلیان هوکا در رستوران فرمونتی",
  servesCuisine: "Persian",
  address: {
    "@type": "PostalAddress",
    addressLocality: "تهران",
    addressRegion: "شهرک غرب",
    streetAddress: "خیابان ایران‌زمین، خیابان مهستان، نبش کوچه دوم",
    addressCountry: "IR",
  },
  telephone: "+989912221025",
  url: "https://fermontee.restaurant",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preload" as="image" href="/images/manifesto/frames/frame-001.webp" type="image/webp" />
        <link rel="preload" as="image" href="/images/manifesto/frames/frame-002.webp" type="image/webp" />
        <link rel="preload" as="image" href="/images/closing/closing-01.webp" type="image/webp" />
        <link rel="preload" as="image" href="/images/flavors/apple-minimal.webp" type="image/webp" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
