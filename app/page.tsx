import Link from "next/link";
import {
  ChefHat,
  Clock,
  Coffee,
  Mail,
  MapPin,
  Moon,
  Phone,
  Sun,
} from "lucide-react";

import { LandingNav } from "@/components/landing/nav";
import { FAQList } from "@/components/landing/faq";
import { LandingJsonLd } from "@/components/landing/jsonld";
import {
  Bullet,
  InfoCard,
  SectionTitle,
  Stat,
  StepCard,
} from "@/components/landing/sections";
import { LandingT } from "./landing-t";

export const dynamic = "force-static";
export const revalidate = 3600;

/**
 * Bhuk Foods landing page. Ported pixel-for-pixel from
 * design/bhuk_foods_app.jsx (LandingPage), with one spec change:
 * the pricing card uses the new ₹2,600 + delivery + ₹250 SD breakdown.
 *
 * Everything below the nav is rendered in client components because the
 * EN/বাং toggle from the LangProvider applies to most copy.
 */
export default function Landing() {
  return (
    <>
      <LandingJsonLd />
      <LandingNav />
      <main className="max-w-[1080px] mx-auto">
        <LandingT />
      </main>
    </>
  );
}
