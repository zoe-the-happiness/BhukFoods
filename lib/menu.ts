/**
 * Bhuk Foods seven-day brunch + dinner rotation. Sunday is intentionally
 * null because there is no service. Lifted verbatim from the design paste so
 * the cook console + landing page menu sample stay in sync.
 */

export type DailyMenu = {
  brunch_en: string;
  brunch_bn: string;
  dinner_en: string;
  dinner_bn: string;
};

export const MENU_ROTATION: Record<number, DailyMenu | null> = {
  0: null, // Sunday — off
  1: {
    brunch_en: "Chicken curry · fried pointed gourd · masoor dal · rice",
    brunch_bn: "চিকেন ঝোল · পটল ভাজা · মুসুর ডাল · ভাত",
    dinner_en: "4 rotis · shukto · boiled egg",
    dinner_bn: "৪টি রুটি · শুক্তো · সিদ্ধ ডিম",
  },
  2: {
    brunch_en: "Rohu fish curry · mashed potato · moong dal · rice",
    brunch_bn: "রুই মাছের ঝোল · আলু মাখা · মুগ ডাল · ভাত",
    dinner_en: "4 rotis · mixed veg · omelette",
    dinner_bn: "৪টি রুটি · পাঁচমিশালি · অমলেট",
  },
  3: {
    brunch_en: "Chicken kosha · brinjal fry · arhar dal · rice",
    brunch_bn: "চিকেন কষা · বেগুন ভাজা · অড়হর ডাল · ভাত",
    dinner_en: "4 rotis · niramish labra · boiled egg",
    dinner_bn: "৪টি রুটি · নিরামিষ লাবড়া · সিদ্ধ ডিম",
  },
  4: {
    brunch_en: "Paneer butter masala · aloo-brinjal · chana dal · rice",
    brunch_bn: "পনির বাটার মশলা · আলু-বেগুন · ছোলার ডাল · ভাত",
    dinner_en: "SPECIAL · Pulao + dum aloo",
    dinner_bn: "স্পেশাল · পোলাও + আলুর দম",
  },
  5: {
    brunch_en: "Egg dalna · ridge gourd fry · matar dal · rice",
    brunch_bn: "ডিম ডালনা · ঝিঙে ভাজা · মটর ডাল · ভাত",
    dinner_en: "4 rotis · chorchori · omelette",
    dinner_bn: "৪টি রুটি · চচ্চড়ি · অমলেট",
  },
  6: {
    brunch_en: "Katla / tilapia curry · aloo-ridge gourd · biuli dal · rice",
    brunch_bn: "কাতলা / তেলাপিয়া · আলু-ঝিঙে · বিউলির ডাল · ভাত",
    dinner_en: "4 rotis · lau ghonto · egg bhujia",
    dinner_bn: "৪টি রুটি · লাউ ঘণ্ট · ডিম ভুজিয়া",
  },
};

export function menuForDay(serviceDate: string): DailyMenu | null {
  const [y, m, d] = serviceDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return MENU_ROTATION[dt.getDay()] ?? null;
}
