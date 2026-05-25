import type { Metadata, Viewport } from "next";
import { Fraunces, Figtree, Noto_Sans_Bengali } from "next/font/google";
import { cookies } from "next/headers";

import { LangProvider, type Lang } from "@/lib/i18n/lang-provider";
import { ServiceWorkerRegister } from "@/components/push/service-worker-register";
import { PwaInstallPrompt } from "@/components/pwa/install-prompt";

import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700", "800"],
});

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
});

const notoBn = Noto_Sans_Bengali({
  subsets: ["bengali"],
  display: "swap",
  variable: "--font-noto-bn",
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bhukfoods.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Bhuk Foods — Tiffin service in Agarpara · NIT & JIS · home-style Bengali meals",
    template: "%s · Bhuk Foods",
  },
  description:
    "Bhuk Foods is India's first kitchen substitution service. Prepaid monthly home-style Bengali tiffin delivered to NIT Agarpara and JIS University students. Two meals a day, Mon–Sat. FSSAI-registered kitchen at 43 Matangini Hazra Pally.",
  applicationName: "Bhuk Foods",
  authors: [{ name: "Nirmalya Ranjan Sarkar", url: SITE_URL }],
  creator: "Bhuk Foods",
  publisher: "Bhuk Foods",
  keywords: [
    "tiffin service Agarpara",
    "tiffin near NIT Agarpara",
    "tiffin near Narula Institute of Technology",
    "tiffin near JIS University",
    "tiffin for students Agarpara",
    "Bengali tiffin Kolkata",
    "monthly meal subscription Agarpara",
    "mess for students Agarpara",
    "home-cooked tiffin Sodepur",
    "tiffin Khardah Panihati",
    "tiffin Belghoria Kamarhati",
    "FSSAI registered tiffin Kolkata",
    "kitchen substitution service",
    "BLPGA paying guest food",
    "Bhuk Foods",
  ],
  category: "Food & Drink",
  alternates: {
    canonical: SITE_URL,
    languages: { "en-IN": SITE_URL, "bn-IN": SITE_URL },
  },
  openGraph: {
    type: "website",
    siteName: "Bhuk Foods",
    url: SITE_URL,
    title:
      "Bhuk Foods — Tiffin service for NIT Agarpara & JIS University students",
    description:
      "India's first kitchen substitution service. Two home-style Bengali meals a day, Mon–Sat, delivered around Agarpara. FSSAI-registered.",
    locale: "en_IN",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bhuk Foods — India's first kitchen substitution service, Agarpara, Kolkata",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Bhuk Foods — Tiffin service for NIT Agarpara & JIS University students",
    description:
      "India's first kitchen substitution service. Two home-style Bengali meals a day, Mon–Sat.",
    images: ["/og-image-twitter.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  other: {
    "format-detection": "telephone=yes",
    "msvalidate.01": "",
    "geo.region": "IN-WB",
    "geo.placename": "Agarpara, Kolkata",
    "geo.position": "22.6816;88.3799",
    ICBM: "22.6816, 88.3799",
  },
};

export const viewport: Viewport = {
  themeColor: "#FBF1DE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const langCookie = cookies().get("bhuk-lang")?.value;
  const initialLang: Lang = langCookie === "bn" ? "bn" : "en";

  return (
    <html
      lang={initialLang}
      className={`${fraunces.variable} ${figtree.variable} ${notoBn.variable}`}
    >
      <body className="bg-bhuk-cream text-bhuk-ink antialiased">
        <ServiceWorkerRegister />
        <LangProvider initial={initialLang}>
          {children}
          <PwaInstallPrompt />
        </LangProvider>
        {gaId ? (
          <>
            {/* Google Analytics 4 — measurement id ${gaId} */}
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${gaId}', { anonymize_ip: true });`,
              }}
            />
          </>
        ) : null}
        {clarityId ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${clarityId}");`,
            }}
          />
        ) : null}
      </body>
    </html>
  );
}
