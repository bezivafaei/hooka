import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: "HOOKA — A Ritual, Reimagined",
    description: "منوی دیجیتال پریمیوم هوکا در فرمونتی؛ چهار تجربه برای آهسته‌تر شدن شب.",
    openGraph: {
      title: "HOOKA — A Ritual, Reimagined",
      description: "A premium digital hookah menu by Fermontee.",
      type: "website",
      locale: "fa_IR",
      images: [{ url: `${origin}/og.png`, width: 1732, height: 906, alt: "HOOKA — A Ritual, Reimagined" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "HOOKA — A Ritual, Reimagined",
      description: "A premium digital hookah menu by Fermontee.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
