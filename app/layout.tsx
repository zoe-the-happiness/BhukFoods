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
    default: "Bhuk Foods — Home-style monthly meal plan in Agarpara",
    template: "%s · Bhuk Foods",
  },
  description:
    "Prepaid monthly meal subscription: 26 days × 2 home-cooked meals for ₹2,600. BLPGA delivery free; self-pickup at the Agarpara kitchen, or quoted home delivery.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    siteName: "Bhuk Foods",
    url: SITE_URL,
    title: "Bhuk Foods — Home-style monthly meal plan",
    description:
      "₹100 / meal · 26 days × 2 meals / month · Agarpara kitchen · Free BLPGA delivery",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bhuk Foods — Home-style monthly meal plan",
    description: "₹100 / meal · 26 days × 2 meals / month · Agarpara kitchen",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#FBF1DE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
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
