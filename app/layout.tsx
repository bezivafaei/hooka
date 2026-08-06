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
    title: "هوکا — آیین شب، از نو",
    description: "منوی دیجیتال هوکا در فرمونتی؛ چهار تجربه برای شب‌هایی آهسته‌تر.",
    openGraph: {
      title: "هوکا — آیین شب، از نو",
      description: "منوی دیجیتال هوکا در فرمونتی؛ چهار تجربه برای شب‌هایی آهسته‌تر.",
      type: "website",
      locale: "fa_IR",
      images: [{ url: `${origin}/og.png`, width: 1732, height: 906, alt: "هوکا — آیین شب، از نو" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "هوکا — آیین شب، از نو",
      description: "منوی دیجیتال هوکا در فرمونتی.",
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
