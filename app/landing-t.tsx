"use client";

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

import { FAQList } from "@/components/landing/faq";
import { ReviewsMarquee } from "@/components/landing/reviews-marquee";
import {
  Bullet,
  InfoCard,
  SectionTitle,
  Stat,
  StepCard,
} from "@/components/landing/sections";
import { useT } from "@/lib/i18n/lang-provider";
import { HERO_CAROUSEL, ik, IK, PHOTOS } from "@/lib/photos";
import { GOOGLE_BUSINESS_URL } from "@/lib/reviews";

const LOGO_TRANS = "https://ik.imagekit.io/bhukfoods/Logo/Logo%2020260523%201951_Trans.webp";

/** All landing copy in one client tree because every block uses useT(). */
export function LandingT() {
  const t = useT();

  return (
    <>
      {/* HERO — full-width banner with a crossfading photo carousel behind the copy */}
      <section className="relative overflow-hidden">
        {/* Background carousel: 7 images on a 49s loop. Each image gets a
            7-second window with a 1.5s crossfade in/out and a slow Ken-Burns
            zoom (scale 1.00 → 1.08). Animation rules live in globals.css. */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {HERO_CAROUSEL.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={ik(src, IK.heroBg)}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              className="bhuk-hero-bg-img"
            />
          ))}
          {/* Two-layer wash: a vertical cream gradient (stronger at top + bottom
              so headline and CTAs always read clean), plus a constant 25%
              cream tint to lift contrast at the centre. */}
          <div className="absolute inset-0 bg-gradient-to-b from-bhuk-cream/65 via-bhuk-cream/15 to-bhuk-cream/80" />
          <div className="absolute inset-0 bg-bhuk-cream/15" />
        </div>

        <div className="relative px-[18px] pt-12 pb-12 max-w-[760px]">
          <div className="inline-flex items-center gap-[6px] bg-bhuk-amber-bg text-bhuk-amber-ink px-[11px] py-[5px] rounded-pill text-[11.5px] font-extrabold mb-[14px]">
            <MapPin size={11} />
            {t(
              "NIT Agarpara · JIS University · 5 min walk",
              "NIT Agarpara · JIS University · ৫ মিনিট",
            )}
          </div>
          <h1 className="font-serif font-bold text-[38px] sm:text-[44px] leading-[1.05] text-bhuk-maroon -tracking-[0.5px] mb-[14px]">
            {t(
              <>
                Home-style Bengali<br />tiffin for students
              </>,
              <>
                ছাত্র-ছাত্রীদের জন্য<br />ঘরোয়া বাঙালি রান্না
              </>,
            )}
          </h1>
          <p className="text-[15px] leading-relaxed text-bhuk-ink mb-[6px]">
            {t(
              <>
                Two fresh-cooked meals delivered to PGs and hostels in
                Agarpara. Brunch and dinner, Monday to Saturday. A simple
                monthly subscription —{" "}
                <a href="#pricing" className="text-bhuk-terra font-bold underline underline-offset-2">
                  see pricing →
                </a>
              </>,
              <>
                আগরপাড়ার ছাত্রাবাস ও PG-তে দু&apos;বেলা টাটকা রান্না করা খাবার।
                ব্রাঞ্চ আর ডিনার, সোম থেকে শনি। সাধারণ মাসিক সাবস্ক্রিপশন —{" "}
                <a href="#pricing" className="text-bhuk-terra font-bold underline underline-offset-2">
                  মূল্য দেখুন →
                </a>
              </>,
            )}
          </p>
          <p className="text-[13.5px] leading-relaxed text-bhuk-ink2 mb-[22px]">
            {t(
              "Home-style Bengali tiffin for NIT Agarpara and JIS University students. FSSAI-registered kitchen at 43, Matangini Hazra Pally.",
              "NIT Agarpara আর JIS University-র ছাত্রছাত্রীদের জন্য ঘরোয়া বাঙালি রান্না। FSSAI-নিবন্ধিত রান্নাঘর ৪৩, মাতঙ্গিনী হাজরা পল্লীতে।",
            )}
          </p>
          <div className="flex flex-wrap gap-[10px]">
            <Link
              href="/join"
              className="bg-bhuk-maroon text-white px-5 py-[13px] rounded-[11px] text-[14px] font-extrabold no-underline inline-flex items-center gap-[7px] shadow-card"
            >
              {t("Subscribe now", "এখনই সাবস্ক্রাইব")}
            </Link>
            <a
              href="tel:+917595923777"
              className="bg-white/95 backdrop-blur border-[1.5px] border-bhuk-line text-bhuk-ink px-5 py-[13px] rounded-[11px] text-[14px] font-extrabold no-underline inline-flex items-center gap-[7px]"
            >
              <Phone size={15} />
              {t("Call 75959 23777", "কল ৭৫৯৫৯ ২৩৭৭৭")}
            </a>
            <a
              href="https://wa.me/917595923777?text=Hi%2C%20I%27m%20interested%20in%20Bhuk%20Foods%20tiffin"
              className="bg-white/95 backdrop-blur border-[1.5px] border-bhuk-line text-bhuk-ink px-5 py-[13px] rounded-[11px] text-[14px] font-extrabold no-underline inline-flex items-center gap-[7px]"
            >
              <Mail size={15} />
              {t("WhatsApp", "WhatsApp")}
            </a>
          </div>
        </div>
        <div className="relative px-[18px] grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-[10px] pb-10 max-w-[760px]">
          <Stat n={t("2 meals", "২ বেলা")} l={t("brunch + dinner", "ব্রাঞ্চ + ডিনার")} />
          <Stat n={t("26 days", "২৬ দিন")} l={t("Mon to Sat", "সোম-শনি")} />
          <Stat n="4 PM" l={t("cancel cutoff", "বাতিলের সময়সীমা")} />
          <Stat n="FSSAI" l={t("registered kitchen", "নিবন্ধিত রান্নাঘর")} />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-[18px] py-7 border-t border-bhuk-off">
        <SectionTitle en="How it works" bn="কীভাবে কাজ করে" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[14px] mt-[14px]">
          <StepCard
            n={t("1", "১")}
            t={t("Pay your monthly fee", "মাসিক ফি দিন")}
            d={t(
              "Send by UPI or bank transfer. The admin verifies and credits a month's meal days to your account. See pricing below.",
              "UPI বা ব্যাঙ্ক ট্রান্সফারে পাঠান। অ্যাডমিন যাচাই করে এক মাসের মিল দিন যোগ করেন। নিচে মূল্য দেখুন।",
            )}
          />
          <StepCard
            n={t("2", "২")}
            t={t("Get two meals every day", "রোজ দু'বেলা খাবার")}
            d={t(
              "Monday to Saturday. Brunch and dinner delivered to your hostel or PG.",
              "সোম-শনি, ব্রাঞ্চ আর ডিনার, আপনার হোস্টেল/PG তে পৌঁছে যাবে।",
            )}
          />
          <StepCard
            n={t("3", "৩")}
            t={t("Tell us in advance if you'll skip", "না খেলে আগেই বলুন")}
            d={t(
              "Cancel any day in the app before 4 PM the previous day. Your balance funds a later day, so the plan extends.",
              "আগের দিন বিকেল ৪টার আগে অ্যাপে ট্যাপ করুন। সেই দিনের টাকা মেয়াদের শেষে যোগ হবে।",
            )}
          />
        </div>
      </section>

      {/* PRICING — single source of truth. Everywhere else links to #pricing. */}
      <section id="pricing" className="px-[18px] py-7 border-t border-bhuk-off scroll-mt-24">
        <SectionTitle en="Pricing" bn="মূল্য" />
        <div className="bg-white border-[1.5px] border-bhuk-line rounded-card p-5 mt-[14px] max-w-[560px]">
          <div className="flex items-baseline gap-[6px] text-bhuk-maroon">
            <span className="font-serif font-bold text-[38px] leading-none">
              {t("₹2,600", "₹২৬০০")}
            </span>
            <span className="text-[14px] font-bold text-bhuk-terra">
              {t("/ month", "/ মাস")}
            </span>
          </div>
          <div className="text-[12.5px] text-bhuk-ink2 mt-1">
            {t(
              "26 days × 2 meals · just ₹100 per meal day",
              "২৬ দিন × ২ বেলা · দিন প্রতি মাত্র ₹১০০",
            )}
          </div>

          <div className="mt-4 grid gap-[7px]">
            <div className="font-extrabold text-[13px] text-bhuk-ink mt-2">
              {t("+ Delivery (extra):", "+ ডেলিভারি (অতিরিক্ত):")}
            </div>
            <PriceRow label={t("BLPGA residents", "BLPGA-এ থাকা")} value={t("₹0", "₹০")} />
            <PriceRow label={t("Self-pickup at kitchen", "নিজে এসে নেওয়া")} value={t("₹0", "₹০")} />
            <PriceRow
              label={t("Home delivery", "বাড়িতে ডেলিভারি")}
              value={t("quote at signup", "শুরুতে কোট")}
            />
          </div>

          <div className="mt-4 grid gap-[7px]">
            <div className="font-extrabold text-[13px] text-bhuk-ink mt-2">
              {t("+ One-time refundable security deposit:", "+ এককালীন ফেরতযোগ্য জামানত:")}
            </div>
            <PriceRow
              label={t("Tiffin containers + carrier bag", "টিফিন বক্স + ক্যারিয়ার ব্যাগ")}
              value={t("₹250", "₹২৫০")}
            />
            <div className="text-[11.5px] text-bhuk-off-ink">
              {t("Not required for BLPGA residents", "BLPGA-এ থাকার জন্য প্রযোজ্য নয়")}
            </div>
          </div>

          <div className="border-t border-bhuk-off mt-5 pt-3 grid gap-[9px]">
            <Bullet
              t={t(
                "Brunch: rice · dal · main (chicken/fish/paneer/egg on rotation) · vegetable side",
                "ব্রাঞ্চ: ভাত · ডাল · মূল পদ (চিকেন/মাছ/পনির/ডিম রোটেশন) · সাইড",
              )}
            />
            <Bullet
              t={t(
                "Dinner: rice / 4 rotis · seasonal vegetable curry · egg",
                "ডিনার: ভাত / ৪টি রুটি · মৌসুমি তরকারি · ডিম",
              )}
            />
            <Bullet
              t={t(
                "Thursday dinner is special: pulao / rajma / soya-chilli",
                "বৃহস্পতিবার ডিনার: স্পেশাল পোলাও / রাজমা / সয়া-চিলি",
              )}
            />
            <Bullet
              t={t(
                "All frying done in an air fryer — less oil, healthier",
                "সব রান্না এয়ার ফ্রায়ারে — তেল কম, স্বাস্থ্যকর",
              )}
            />
            <Bullet
              t={t(
                "FSSAI-registered kitchen, fresh vegetables bought daily",
                "FSSAI-নিবন্ধিত রান্নাঘর, রোজ টাটকা সবজি",
              )}
            />
          </div>

          <Link
            href="/join"
            className="block mt-5 py-[13px] bg-bhuk-maroon text-white text-center font-extrabold text-[14px] rounded-[11px] no-underline"
          >
            {t("Start a subscription", "সাবস্ক্রিপশন শুরু করুন")}
          </Link>
        </div>
      </section>

      {/* TIMINGS */}
      <section className="px-[18px] py-7 border-t border-bhuk-off">
        <SectionTitle en="Timings, off days, kitchen" bn="সময়, ছুটি, রান্নাঘরের ব্যাপারে" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 mt-[14px]">
          <InfoCard
            icon={Coffee}
            t={t("Brunch", "ব্রাঞ্চ")}
            v={t("08:30 AM – 10:00 AM", "সকাল ৮:৩০ – ১০:০০")}
            sub={t("Fresh from the kitchen", "রান্নাঘর থেকে সরাসরি")}
          />
          <InfoCard
            icon={Moon}
            t={t("Dinner", "ডিনার")}
            v={t("6:00 PM – 8:00 PM", "সন্ধ্যা ৬:০০ – রাত ৮:০০")}
            sub={t("Hot rice / rotis and curry", "তাজা গরম ভাত / রুটি ও তরকারি")}
          />
          <InfoCard
            icon={Sun}
            t={t("Sunday off", "রবিবার বন্ধ")}
            v={t("No delivery", "কোনো ডেলিভারি নেই")}
            sub={t("Weekly off, no charge", "সাপ্তাহিক ছুটি, কোনো চার্জ নেই")}
          />
          <InfoCard
            icon={ChefHat}
            t={t("Kitchen / cook leave", "রান্নাঘরের ছুটি")}
            v={t("Announced in advance", "আগে থেকে জানানো হবে")}
            sub={t(
              "In-app notice, no charge for that day",
              "অ্যাপে নোটিশ পাবেন, সেই দিনের টাকা কাটা যাবে না",
            )}
          />
        </div>
      </section>

      {/* NO-MEAL-DAY */}
      <section className="px-[18px] py-7 border-t border-bhuk-off">
        <SectionTitle en="The no-meal-day system" bn="না খেলে কী হবে?" />
        <div className="bg-white border-[1.5px] border-bhuk-line rounded-card p-[18px] mt-[14px] max-w-[680px]">
          <p className="text-[14px] leading-relaxed text-bhuk-ink mb-3">
            {t(
              "Going home? Unwell? Exams? No problem. Open the app, tap the day, confirm. There's just one rule:",
              "বাড়ি যাচ্ছেন? অসুস্থ? পরীক্ষা? কোনো সমস্যা নেই। অ্যাপে সেই দিনে ট্যাপ করে বাতিল করে দিন। শর্ত একটাই:",
            )}
          </p>
          <div className="bg-bhuk-amber-bg text-bhuk-amber-ink rounded-[12px] px-[14px] py-3 font-extrabold text-[13.5px] flex items-center gap-2">
            <Clock size={16} />
            {t(
              "Cancel before 4 PM the previous day. After 4 PM, the day locks.",
              "আগের দিন বিকেল ৪টার আগে বাতিল করতে হবে। ৪টার পরে দিনটি লক হয়ে যায়।",
            )}
          </div>
          <p className="text-[13.5px] leading-relaxed text-bhuk-ink2 mt-[14px]">
            {t(
              "A cancelled day is never charged. Your balance funds a later day at the end of your plan. So you still get all 26 meal days, just shifted forward.",
              "বাতিল করা দিনে কোনো চার্জ হয় না। আপনার ব্যালান্স দিয়ে মেয়াদের শেষে আরেকটা দিন যোগ হয়। অর্থাৎ ২৬ মিল দিন আপনি পুরোটাই পাবেন, শুধু পিছিয়ে যাবে।",
            )}
          </p>
        </div>
      </section>

      {/* MENU */}
      <section className="px-[18px] py-7 border-t border-bhuk-off">
        <SectionTitle en="Sample · What's on the menu" bn="নমুনা · মেনু কী রকম" />
        <p className="text-[13.5px] text-bhuk-ink2 leading-relaxed mt-2 max-w-[680px]">
          {t(
            "Different every day — a seven-day rotation. Seasonal vegetables, all frying done in an air fryer. Protein changes daily: chicken Mon & Wed, fish Tue & Sat, paneer Thu, egg Fri.",
            "প্রতিদিন আলাদা — সাত দিনের রোটেশন। মৌসুমি সবজি, সব ভাজা এয়ার ফ্রায়ারে। আমিষ দিন প্রতিদিন বদলায়: সোম ও বুধ চিকেন, মঙ্গল ও শনি মাছ, বৃহঃ পনির, শুক্র ডিম।",
          )}
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[10px] mt-[14px]">
          <MenuCard
            day={t("Monday", "সোমবার")}
            photo={PHOTOS.menuMon}
            brunch={t(
              "Chicken curry · fried pointed gourd · masoor dal · rice",
              "চিকেন ঝোল · পটল ভাজা · মুসুর ডাল · ভাত",
            )}
            dinner={t("4 rotis · shukto · boiled egg", "৪টি রুটি · শুক্তো · সিদ্ধ ডিম")}
          />
          <MenuCard
            day={t("Tuesday", "মঙ্গলবার")}
            photo={PHOTOS.menuTue}
            brunch={t(
              "Rohu fish curry · mashed potato · moong dal · rice",
              "রুই মাছের ঝোল · আলু মাখা · মুগ ডাল · ভাত",
            )}
            dinner={t("4 rotis · mixed veg · omelette", "৪টি রুটি · পাঁচমিশালি · অমলেট")}
          />
          <MenuCard
            day={t("Thursday (special)", "বৃহঃ (স্পেশাল)")}
            photo={PHOTOS.menuThu}
            brunch={t(
              "Paneer butter masala · side · chana dal · rice",
              "পনির বাটার মশলা · সাইড · ডাল · ভাত",
            )}
            dinner={t("Pulao + dum aloo", "পোলাও + আলুর দম")}
          />
          <MenuCard
            day={t("Saturday", "শনিবার")}
            photo={PHOTOS.menuSat}
            brunch={t(
              "Katla fish curry · potato-ridge gourd · biuli dal · rice",
              "কাতলা মাছের কারি · আলু-ঝিঙে · বিউলির ডাল · ভাত",
            )}
            dinner={t("4 rotis · lau ghonto · egg bhujia", "৪টি রুটি · লাউ ঘণ্ট · ডিম ভুজিয়া")}
          />
        </div>
      </section>

      {/* FROM THE KITCHEN — photo gallery */}
      <section className="px-[18px] py-7 border-t border-bhuk-off">
        <SectionTitle en="From the kitchen" bn="রান্নাঘর থেকে" />
        <p className="text-[13.5px] text-bhuk-ink2 leading-relaxed mt-2 max-w-[680px]">
          {t(
            "Snapshots from 43, Matangini Hazra Pally — morning groceries, the air fryer in motion, the cook at her station, plates going out the door.",
            "৪৩, মাতঙ্গিনী হাজরা পল্লীর কিছু ঝলক — সকালের বাজার, এয়ার ফ্রায়ারে ভাজা, রান্নার দাদার হাতের কাজ, প্যাক হয়ে রওনা।",
          )}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-[10px] mt-[14px]">
          {PHOTOS.kitchen.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={ik(src, IK.card)}
              alt={t(
                `Bhuk Foods kitchen — photo ${i + 1}`,
                `Bhuk Foods রান্নাঘর — ছবি ${i + 1}`,
              ) as string}
              loading="lazy"
              className="w-full aspect-[4/3] object-cover rounded-card border border-bhuk-line"
            />
          ))}
        </div>
      </section>

      {/* REVIEWS — Google Business profile marquee */}
      <section className="py-7 border-t border-bhuk-off">
        <div className="px-[18px]">
          <SectionTitle
            en="What our customers say"
            bn="গ্রাহকরা কী বলছেন"
          />
          <p className="text-[13.5px] text-bhuk-ink2 leading-relaxed mt-2 max-w-[680px]">
            {t(
              <>
                Real reviews from real students and parents on our Google Business
                profile. Tap any card to open the full review.{" "}
                <a
                  href={GOOGLE_BUSINESS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-bhuk-terra font-bold underline underline-offset-2"
                >
                  See all on Google →
                </a>
              </>,
              <>
                আমাদের Google Business প্রোফাইলে আসল ছাত্রছাত্রী আর অভিভাবকদের রিভিউ।
                যেকোনো কার্ডে ট্যাপ করে পুরো রিভিউ পড়ুন।{" "}
                <a
                  href={GOOGLE_BUSINESS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-bhuk-terra font-bold underline underline-offset-2"
                >
                  Google-এ সব দেখুন →
                </a>
              </>,
            )}
          </p>
        </div>
        <ReviewsMarquee />
      </section>

      {/* DELIVERY */}
      <section className="px-[18px] py-7 border-t border-bhuk-off">
        <SectionTitle en="Delivery area" bn="ডেলিভারি এলাকা" />
        <p className="text-[13.5px] text-bhuk-ink2 leading-relaxed mt-2 max-w-[680px]">
          {t(
            <>
              Our kitchen is at <b className="text-bhuk-ink">43, Matangini Hazra Pally, Agarpara, Kolkata 700109</b>. About 5 minutes walk from NIT Agarpara and JIS University.
            </>,
            <>
              আমাদের রান্নাঘর <b className="text-bhuk-ink">৪৩, মাতঙ্গিনী হাজরা পল্লী, আগরপাড়া, কলকাতা ৭০০১০৯</b> এ। NIT Agarpara আর JIS University থেকে হাঁটাপথে ৫ মিনিট।
            </>,
          )}
        </p>
        <div className="flex flex-wrap gap-2 mt-[14px]">
          {[
            "NIT Agarpara",
            "JIS University",
            "Matangini Hazra Pally",
            "Deshpriya Nagar",
            "Jagarata Pally",
            "Nilgunj Road",
            "BSS Road",
            "Sodepur",
            "Khardah",
            "Panihati",
            "Belghoria",
            "Kamarhati",
          ].map((p) => (
            <span
              key={p}
              className="bg-white border border-bhuk-line px-[11px] py-[6px] rounded-pill text-[12px] font-semibold text-bhuk-ink2"
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-[18px] py-7 border-t border-bhuk-off">
        <SectionTitle en="Frequently asked questions" bn="সাধারণ প্রশ্ন" />
        <FAQList />
      </section>

      {/* FOOTER */}
      <footer className="px-[18px] pt-8 pb-10 border-t border-bhuk-off bg-[#FAF4E6] mt-5">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[20px] max-w-[1040px]">
          <div>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_TRANS} alt="Bhuk Foods" width={36} height={36} className="rounded-[7px]" />
              <div className="font-serif font-bold text-[18px] text-bhuk-maroon">
                Bhuk Foods
              </div>
            </div>
            <div className="text-[11.5px] text-bhuk-terra font-bold italic mt-1 max-w-[260px]">
              {t(
                "India's first kitchen substitution service · Stop cooking, start living.",
                "ভারতের প্রথম রান্নাঘর-প্রতিস্থাপন সেবা · রান্না বন্ধ, জীবন শুরু।",
              )}
            </div>
            <div className="text-[12px] text-bhuk-ink2 leading-relaxed mt-3">
              {t(
                <>
                  BLPGA, 43, Matangini Hazra Pally
                  <br />
                  Agarpara, Kolkata 700109
                </>,
                <>
                  BLPGA, ৪৩, মাতঙ্গিনী হাজরা পল্লী
                  <br />
                  আগরপাড়া, কলকাতা ৭০০১০৯
                </>,
              )}
            </div>
            <a
              href="https://maps.app.goo.gl/Nans91VKu2FLVRFw5"
              target="_blank"
              rel="noreferrer"
              className="text-[11.5px] text-bhuk-terra font-bold no-underline mt-2 inline-block"
            >
              📍 {t("Open in Google Maps", "Google Maps খুলুন")} · M9JH+JX
            </a>
          </div>

          <div>
            <div className="text-[11px] font-extrabold text-bhuk-off-ink tracking-wide">
              {t("CONTACT", "যোগাযোগ")}
            </div>
            <div className="text-[13px] text-bhuk-ink mt-[6px] leading-[1.9]">
              <a href="tel:+917595923777" className="text-bhuk-ink no-underline">
                📞 {t("75959 23777", "৭৫৯৫৯ ২৩৭৭৭")}
              </a>
              <br />
              <a
                href="https://wa.me/917595923777"
                target="_blank"
                rel="noreferrer"
                className="text-bhuk-ink no-underline"
              >
                💬 {t("WhatsApp", "WhatsApp")}
              </a>
              <br />
              <a href="mailto:bhukfoods@gmail.com" className="text-bhuk-ink no-underline">
                ✉ bhukfoods@gmail.com
              </a>
            </div>
            <div className="text-[11px] font-extrabold text-bhuk-off-ink tracking-wide mt-4">
              {t("FOLLOW", "ফলো করুন")}
            </div>
            <div className="text-[13px] text-bhuk-ink mt-[6px] leading-[1.9]">
              <a
                href="https://www.instagram.com/bhukfoods/"
                target="_blank"
                rel="noreferrer"
                className="text-bhuk-ink no-underline"
              >
                📷 Instagram
              </a>
              <br />
              <a
                href="https://www.facebook.com/profile.php?id=61582663376504"
                target="_blank"
                rel="noreferrer"
                className="text-bhuk-ink no-underline"
              >
                👍 Facebook
              </a>
              <br />
              <a
                href="https://www.youtube.com/@BhukFoods"
                target="_blank"
                rel="noreferrer"
                className="text-bhuk-ink no-underline"
              >
                ▶ YouTube
              </a>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-extrabold text-bhuk-off-ink tracking-wide">
              {t("EXPLORE", "ঘুরে দেখুন")}
            </div>
            <div className="text-[13px] mt-[6px] leading-[1.9]">
              <Link href="/blog" className="text-bhuk-ink no-underline">
                {t("Blog", "ব্লগ")}
              </Link>
              <br />
              <Link href="/join" className="text-bhuk-ink no-underline">
                {t("Subscribe", "সাবস্ক্রাইব")}
              </Link>
              <br />
              <Link href="/login" className="text-bhuk-terra font-bold no-underline">
                {t("Customer / Admin / Kitchen →", "গ্রাহক / অ্যাডমিন / রান্নাঘর →")}
              </Link>
            </div>

            <div className="text-[11px] font-extrabold text-bhuk-off-ink tracking-wide mt-4">
              {t("REGISTRATIONS", "রেজিস্ট্রেশন")}
            </div>
            <div className="text-[10.5px] text-bhuk-ink2 mt-[4px] leading-relaxed font-mono">
              FSSAI 22825131000756
              <br />
              Trade Lic. 0917P3084125375816
              <br />
              MSME UDYAM-WB-14-0087932
            </div>
          </div>
        </div>

        <div className="text-[11px] text-bhuk-off-ink mt-8 leading-relaxed max-w-[1040px] border-t border-bhuk-off pt-4">
          Kitchen substitution service Agarpara · Monthly tiffin near Narula Institute of Technology · Tiffin for JIS University students · Bengali home-cooked tiffin Sodepur · Student mess Belghoria · Monthly meal plan Kolkata north suburbs · BLPGA paying guest food
        </div>
        <div className="text-[10.5px] text-bhuk-off-ink mt-2">
          © {new Date().getFullYear()} Bhuk Foods · Made in Agarpara · Baked with hunger by{" "}
          <a
            href="https://www.zoethehappiness.com"
            target="_blank"
            rel="noreferrer noopener"
            className="text-bhuk-terra font-semibold no-underline hover:underline"
          >
            Zoe
          </a>
        </div>
      </footer>
    </>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[13px] text-bhuk-ink">
      <span>{label}</span>
      <span className="font-extrabold">{value}</span>
    </div>
  );
}

function MenuCard({
  day,
  brunch,
  dinner,
  photo,
}: {
  day: string;
  brunch: string;
  dinner: string;
  photo?: string;
}) {
  const t = useT();
  return (
    <div className="bg-white border border-bhuk-line rounded-[14px] overflow-hidden">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ik(photo, IK.card)}
          alt={day}
          loading="lazy"
          className="w-full aspect-[16/10] object-cover"
        />
      ) : null}
      <div className="p-[14px]">
        <div className="font-serif font-bold text-bhuk-maroon text-[14.5px]">{day}</div>
        <div className="mt-2 text-[12.5px] text-bhuk-ink2 leading-relaxed">
          <div>
            <b className="text-bhuk-terra">{t("Brunch", "ব্রাঞ্চ")} ·</b> {brunch}
          </div>
          <div className="mt-[4px]">
            <b className="text-bhuk-green-ink">{t("Dinner", "ডিনার")} ·</b> {dinner}
          </div>
        </div>
      </div>
    </div>
  );
}
