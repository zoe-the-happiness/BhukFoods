"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { useT } from "@/lib/i18n/lang-provider";

type Q = { en_q: string; bn_q: string; en_a: string; bn_a: string };

const QUESTIONS: Q[] = [
  {
    en_q: "What is the monthly cost of Bhuk Foods tiffin?",
    bn_q: "Bhuk Foods-এর মাসিক খরচ কত?",
    en_a:
      "Bhuk Foods costs ₹2,600 per month for two meals a day — brunch and dinner — Monday to Saturday, prepaid. Sunday is always off. The plan runs on a money-balance basis: ₹100 equals one meal day, so ₹2,600 buys 26 meal days. Delivery is free for BLPGA residents and self-pickup, and quoted at signup for home delivery.",
    bn_a:
      "মাসিক ₹২৬০০। সোম থেকে শনি, ব্রাঞ্চ + ডিনার, প্রিপেইড। রবিবার বন্ধ। ১ দিন = ₹১০০, তাই ₹২৬০০ দিলে ২৬টি মিল দিন পাবেন। BLPGA ও নিজে এসে নিলে ডেলিভারি ফ্রি; বাড়িতে ডেলিভারির ক্ষেত্রে শুরুতে কোট দেওয়া হবে।",
  },
  {
    en_q: "Is there a tiffin service near Narula Institute of Technology Agarpara?",
    bn_q: "NIT Agarpara-র কাছে কি টিফিন সার্ভিস আছে?",
    en_a:
      "Yes. Bhuk Foods is located at 43, Matangini Hazra Pally, about 5 minutes from NIT Agarpara and JIS University. We serve students living in PGs and rented rooms in Agarpara, Sodepur, Khardah, Panihati, Belghoria and Kamarhati.",
    bn_a:
      "হ্যাঁ। ৪৩, মাতঙ্গিনী হাজরা পল্লীতে আমাদের রান্নাঘর — NIT আর JIS থেকে হাঁটাপথে ৫ মিনিট। আগরপাড়া, সোদপুর, খড়দহ, পানিহাটি, বেলঘরিয়া, কামারহাটি এর PG ও রুমে আমরা ডেলিভারি দিই।",
  },
  {
    en_q: "Can I skip a meal day if I am travelling home for the weekend?",
    bn_q: "উইকেন্ডে বাড়ি গেলে কি মিল বাতিল করা যাবে?",
    en_a:
      "Yes. Open the app, tap the day you want to skip, and confirm. There is one rule: you must cancel before 4 PM the previous day. After 4 PM that day locks. A cancelled day is not charged and your balance funds a later day, so the plan extends at the end.",
    bn_a:
      "হ্যাঁ। অ্যাপে দিনে ট্যাপ করে বাতিল করুন। শর্ত: আগের দিন বিকেল ৪টার আগে। ৪টার পরে দিনটি লক। বাতিল দিনে চার্জ হয় না, ব্যালান্স মেয়াদের শেষে যোগ হয়।",
  },
  {
    en_q: "What happens if the cook takes leave?",
    bn_q: "রান্নার দাদা ছুটি নিলে কী হবে?",
    en_a:
      "On a cook-leave day there is no delivery and no charge. The admin marks the day off for everyone in advance, you see it in the app as a grey closed day, and your plan extends by one day at the end.",
    bn_a:
      "সেই দিন কোনো ডেলিভারি নেই, কোনো চার্জ নেই। আগে থেকেই অ্যাপে গ্রে রঙে দেখাবে, এবং আপনার মেয়াদ এক দিন বেড়ে যাবে।",
  },
  {
    en_q: "What kind of food does Bhuk Foods serve?",
    bn_q: "কেমন খাবার পরিবেশন করা হয়?",
    en_a:
      "Home-style Bengali food. Brunch is rice with dal, a main dish (chicken on Mon and Wed, fish on Tue and Sat, paneer on Thu, egg on Fri) and a vegetable side. Dinner is roti with seasonal vegetable curry and an egg. Thursday dinner is special pulao or rajma. All frying uses an air fryer.",
    bn_a:
      "ঘরোয়া বাঙালি রান্না। ব্রাঞ্চে ভাত-ডাল, মূল পদ (সোম/বুধ চিকেন, মঙ্গল/শনি মাছ, বৃহঃ পনির, শুক্র ডিম) ও সাইড। ডিনারে রুটি, মৌসুমি তরকারি, ডিম। বৃহঃ ডিনার স্পেশাল পোলাও/রাজমা। সব ভাজা এয়ার ফ্রায়ারে।",
  },
  {
    en_q: "What are the meal timings?",
    bn_q: "মিলের সময় কখন?",
    en_a:
      "Brunch is delivered between 10:30 AM and 12:00 noon. Dinner is delivered between 7:30 PM and 9:00 PM. Service runs Monday to Saturday. Sunday is always off.",
    bn_a:
      "ব্রাঞ্চ: সকাল ১০:৩০ থেকে দুপুর ১২:০০। ডিনার: রাত ৭:৩০ থেকে ৯:০০। সোম থেকে শনি। রবিবার সবসময় বন্ধ।",
  },
  {
    en_q: "How does a parent pay for their child's tiffin?",
    bn_q: "অভিভাবক কীভাবে টাকা পাঠাবেন?",
    en_a:
      "The parent sends ₹2,600 by UPI or bank transfer to the registered number 7595923777. The admin verifies the payment and adds 26 meal days to the student's account. Parents can pay for a full semester in one transfer.",
    bn_a:
      "৭৫৯৫৯ ২৩৭৭৭ নম্বরে UPI বা ব্যাঙ্ক ট্রান্সফারে ₹২৬০০ পাঠান। অ্যাডমিন যাচাই করে ২৬ মিল দিন যোগ করেন। চাইলে একসাথে সেমেস্টারের টাকাও পাঠাতে পারেন।",
  },
  {
    en_q: "Is Bhuk Foods FSSAI registered?",
    bn_q: "Bhuk Foods কি FSSAI নিবন্ধিত?",
    en_a:
      "Yes. Bhuk Foods runs a FSSAI-registered kitchen at 43, Matangini Hazra Pally, Agarpara. The licence number is displayed in the app and on every meal package.",
    bn_a:
      "হ্যাঁ। ৪৩, মাতঙ্গিনী হাজরা পল্লীতে FSSAI-নিবন্ধিত রান্নাঘর। অ্যাপ ও প্রতিটি প্যাকেজে লাইসেন্স নম্বর দেখানো থাকে।",
  },
];

export function FAQList() {
  const t = useT();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="mt-3 max-w-[760px]">
      {QUESTIONS.map((q, i) => (
        <div key={i} className="border-b border-bhuk-off py-3">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full bg-transparent border-0 text-left cursor-pointer flex justify-between items-center gap-3 p-0"
          >
            <span className="text-[14px] font-bold text-bhuk-ink leading-snug">
              {t(q.en_q, q.bn_q)}
            </span>
            <Plus
              size={16}
              className={`text-bhuk-terra shrink-0 transition-transform ${
                open === i ? "rotate-45" : ""
              }`}
            />
          </button>
          {open === i ? (
            <div className="text-[13px] text-bhuk-ink2 leading-relaxed mt-2">
              {t(q.en_a, q.bn_a)}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
