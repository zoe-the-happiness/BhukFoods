"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { LangToggle } from "@/components/lang-toggle";
import { useT } from "@/lib/i18n/lang-provider";

import { submitJoin } from "./actions";

type Mode = "blpga_onsite" | "self_pickup" | "home_delivery";
type StudentChoice = "yes" | "no" | "";

export function JoinForm() {
  const t = useT();
  const [isStudent, setIsStudent] = useState<StudentChoice>("");
  const [delivery, setDelivery] = useState<Mode>("home_delivery");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setTopError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await submitJoin(fd);
      if (r.ok) {
        setDone(r.pendingId);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setTopError(r.error);
        if (r.fieldErrors) setErrors(r.fieldErrors);
      }
    });
  }

  if (done) {
    return (
      <div className="min-h-screen px-[18px] py-10 flex items-center justify-center">
        <div className="max-w-[420px] bg-white rounded-card p-6 border border-bhuk-line text-center">
          <div className="w-[54px] h-[54px] rounded-full bg-bhuk-green-bg mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 size={28} className="text-bhuk-green-ink" />
          </div>
          <h1 className="font-serif font-bold text-[22px] text-bhuk-maroon">
            {t("Thank you", "ধন্যবাদ")}
          </h1>
          <p className="text-[13.5px] text-bhuk-ink2 mt-2 leading-relaxed">
            {t(
              "A copy is in your email. Bhuk Foods will contact you within 24 hours with the quote and payment details.",
              "আপনার ইমেইলে একটি কপি পাঠানো হয়েছে। ২৪ ঘণ্টার মধ্যে Bhuk Foods আপনাকে দাম ও পেমেন্ট তথ্য সহ যোগাযোগ করবে।",
            )}
          </p>
          <Link
            href="/"
            className="inline-block mt-5 text-bhuk-terra font-bold text-[13px] no-underline"
          >
            {t("← Back to home", "← হোমে ফিরে যান")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto px-[18px] pt-5 pb-12">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-bhuk-terra text-[12.5px] font-bold flex items-center gap-1 no-underline">
          <ArrowLeft size={13} /> {t("Back to home", "হোমে ফিরে যান")}
        </Link>
        <LangToggle />
      </div>
      <div className="text-center mt-4 mb-6">
        <div className="font-serif font-bold text-[30px] text-bhuk-maroon leading-none">
          Bhuk Foods
        </div>
        <div className="text-[12.5px] text-bhuk-terra font-semibold mt-1">
          <Link href="/#pricing" className="text-bhuk-terra no-underline">
            {t("Subscribe — see pricing →", "সাবস্ক্রাইব — মূল্য দেখুন →")}
          </Link>
        </div>
      </div>

      {topError ? (
        <div className="bg-white border-[1.5px] border-bhuk-terra rounded-[11px] p-3 mb-4 text-[12.5px] text-bhuk-terra">
          {topError}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Optional student tag */}
        <Field
          label={t("Are you a student?", "আপনি কি ছাত্র/ছাত্রী?")}
          hint={t("Optional — leave blank if it doesn't apply.", "ঐচ্ছিক — না হলে ফাঁকা রাখুন।")}
        >
          <div className="flex gap-3 mt-1 flex-wrap">
            <Radio
              name="is_student"
              value="yes"
              checked={isStudent === "yes"}
              onChange={() => setIsStudent("yes")}
              label={t("Yes, I am a student", "হ্যাঁ, আমি ছাত্র/ছাত্রী")}
            />
            <Radio
              name="is_student"
              value="no"
              checked={isStudent === "no"}
              onChange={() => setIsStudent("no")}
              label={t("No, working / other", "না, চাকুরিজীবী / অন্য")}
            />
            <button
              type="button"
              onClick={() => setIsStudent("")}
              className={`text-[11.5px] font-bold underline underline-offset-2 ${
                isStudent === "" ? "text-bhuk-off-ink" : "text-bhuk-terra"
              }`}
            >
              {t("Skip", "এড়িয়ে যান")}
            </button>
          </div>
        </Field>

        {isStudent === "yes" ? (
          <>
            <Field label={t("College (optional)", "কলেজ (ঐচ্ছিক)")} error={errors.college}>
              <Select name="college" defaultValue="">
                <option value="">{t("Select…", "নির্বাচন করুন…")}</option>
                <option value="NIT Agarpara">NIT Agarpara</option>
                <option value="JIS University">JIS University</option>
                <option value="Other">{t("Other", "অন্য")}</option>
              </Select>
            </Field>
            <Field label={t("Year of study (optional)", "বর্ষ (ঐচ্ছিক)")} error={errors.year_of_study}>
              <Select name="year_of_study" defaultValue="">
                <option value="">{t("Select…", "নির্বাচন করুন…")}</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
                <option value="4th">4th</option>
                <option value="Other">Other</option>
              </Select>
            </Field>
          </>
        ) : null}

        {/* Name + contact */}
        <Field label={t("Full name", "পুরো নাম")} required error={errors.full_name}>
          <Input name="full_name" autoComplete="name" required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("Phone", "ফোন")} required error={errors.phone}>
            <Input name="phone" type="tel" inputMode="tel" autoComplete="tel" required />
          </Field>
          <Field label={t("WhatsApp", "WhatsApp")} error={errors.whatsapp} hint={t("Defaults to phone", "ফোন নম্বরই ব্যবহার হবে")}>
            <Input name="whatsapp" type="tel" inputMode="tel" />
          </Field>
        </div>
        <Field label={t("Email (used to log in)", "ইমেইল (লগইনের জন্য)")} required error={errors.email}>
          <Input name="email" type="email" autoComplete="email" required />
        </Field>

        {/* Delivery */}
        <Field label={t("How will you get your meals?", "কীভাবে মিল পাবেন?")} required>
          <div className="grid gap-2 mt-1">
            {(
              [
                { v: "blpga_onsite" as const, en: "I live at BLPGA (no delivery, no deposit)", bn: "আমি BLPGA-তে থাকি (কোনো ডেলিভারি নেই, কোনো ডিপোজিট নেই)" },
                { v: "self_pickup" as const, en: "I will pick up from the kitchen (₹250 deposit)", bn: "আমি রান্নাঘর থেকে নিজে নেব (₹২৫০ ডিপোজিট)" },
                { v: "home_delivery" as const, en: "Deliver to my address (quote + ₹250 deposit)", bn: "আমার ঠিকানায় ডেলিভারি (কোট + ₹২৫০ ডিপোজিট)" },
              ]
            ).map((opt) => (
              <label
                key={opt.v}
                className={`flex items-start gap-2 p-3 rounded-[11px] border cursor-pointer ${
                  delivery === opt.v
                    ? "bg-bhuk-green-bg border-bhuk-green"
                    : "bg-white border-bhuk-line"
                }`}
              >
                <input
                  type="radio"
                  name="delivery_mode"
                  value={opt.v}
                  checked={delivery === opt.v}
                  onChange={() => setDelivery(opt.v)}
                  className="mt-[3px]"
                />
                <span className="text-[13px] text-bhuk-ink">{t(opt.en, opt.bn)}</span>
              </label>
            ))}
          </div>
        </Field>

        {delivery === "home_delivery" ? (
          <>
            <Field
              label={t("Google Maps location URL", "Google Maps লোকেশন URL")}
              required
              error={errors.google_maps_url}
              hint={t(
                "Open Maps → drop a pin at your address → Share → copy link.",
                "Maps খুলে আপনার ঠিকানায় পিন বসান → শেয়ার → লিংক কপি করুন।",
              )}
            >
              <Input name="google_maps_url" placeholder="https://maps.app.goo.gl/…" />
            </Field>
            <Field
              label={t("Delivery address (PG / hostel / room number, building, street)", "ডেলিভারি ঠিকানা (PG / হোস্টেল / রুম নম্বর, বিল্ডিং, রাস্তা)")}
              required
              error={errors.delivery_address}
            >
              <Textarea name="delivery_address" rows={4} placeholder={t("Building name, room/flat number, street, area, pincode", "বিল্ডিং, রুম/ফ্ল্যাট নম্বর, রাস্তা, এলাকা, পিনকোড") as string} />
            </Field>
            <Field label={t("Landmark", "ল্যান্ডমার্ক")} error={errors.landmark}>
              <Input name="landmark" />
            </Field>
          </>
        ) : null}

        {delivery === "self_pickup" ? (
          <>
            <Field
              label={t("Where do you live?", "আপনি কোথায় থাকেন?")}
              required
              error={errors.delivery_address}
              hint={t(
                "Helps us reach you in an emergency. Pickup is at 43, Matangini Hazra Pally.",
                "জরুরি অবস্থায় আপনাকে খুঁজে পেতে সাহায্য করবে। মিল নেওয়ার জায়গা ৪৩, মাতঙ্গিনী হাজরা পল্লী।",
              )}
            >
              <Textarea name="delivery_address" rows={3} placeholder={t("Building, room/flat number, street, area, pincode", "বিল্ডিং, রুম/ফ্ল্যাট নম্বর, রাস্তা, এলাকা, পিনকোড") as string} />
            </Field>
            <Field label={t("Landmark", "ল্যান্ডমার্ক")} error={errors.landmark}>
              <Input name="landmark" />
            </Field>
          </>
        ) : null}

        <Field label={t("Allergies or notes", "অ্যালার্জি / নোট")} error={errors.allergies}>
          <Textarea name="allergies" rows={2} />
        </Field>

        <Field label={t("Preferred start date", "শুরু করার পছন্দের তারিখ")} error={errors.start_date}>
          <Input name="start_date" type="date" />
        </Field>

        {/* T&C */}
        <div className="bg-white border border-bhuk-line rounded-[14px] p-4 text-[12px] text-bhuk-ink2 leading-relaxed space-y-2">
          <div className="font-extrabold text-bhuk-maroon text-[13px]">
            {t("Terms & conditions", "শর্তাবলী")}
          </div>
          <ol className="list-decimal pl-4 space-y-1">
            <li>
              {t(
                "Bhuk Foods is a prepaid monthly meal subscription.",
                "Bhuk Foods প্রিপেইড মাসিক মিল সাবস্ক্রিপশন।",
              )}
            </li>
            <li>
              {t(
                "Delivery: free for BLPGA residents and self-pickup. Home delivery is quoted at signup.",
                "ডেলিভারি: BLPGA ও নিজে এসে নিলে ফ্রি। বাড়িতে ডেলিভারির ক্ষেত্রে শুরুতে কোট দেওয়া হবে।",
              )}
            </li>
            <li>
              {t(
                "A refundable security deposit of ₹250 applies to self-pickup and home delivery (not BLPGA).",
                "নিজে নেওয়া ও বাড়িতে ডেলিভারির জন্য ₹২৫০ ফেরতযোগ্য জামানত (BLPGA-র জন্য নয়)।",
              )}
            </li>
            <li>
              {t(
                "Service Mon–Sat. Sunday is always off; no charge.",
                "পরিষেবা সোম–শনি। রবিবার বন্ধ, কোনো চার্জ নেই।",
              )}
            </li>
            <li>
              {t(
                "You may cancel any day up to 4 PM the previous day. After that, the day locks and is charged.",
                "যেকোনো দিন আগের দিন বিকেল ৪টা পর্যন্ত বাতিল করা যায়। ৪টার পরে দিনটি লক হয়ে চার্জ হয়।",
              )}
            </li>
            <li>
              {t(
                "Cook-leave or global off days: no delivery, no charge — your plan extends by that day.",
                "রান্নাঘর / সবার জন্য বন্ধ দিন: কোনো ডেলিভারি নেই, কোনো চার্জ নেই — মেয়াদ এক দিন বাড়বে।",
              )}
            </li>
            <li>
              <div>{t("Damage schedule — deducted from your security deposit:", "ক্ষতির তালিকা — জামানত থেকে কাটা হবে:")}</div>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                <li>{t("Small container — ₹25", "ছোট কন্টেইনার — ₹২৫")}</li>
                <li>{t("Medium container — ₹50", "মাঝারি কন্টেইনার — ₹৫০")}</li>
                <li>{t("Container lid — ₹50", "কন্টেইনার ঢাকনা — ₹৫০")}</li>
                <li>{t("Large container — ₹100", "বড় কন্টেইনার — ₹১০০")}</li>
                <li>{t("Carrier bag — ₹75", "ক্যারিয়ার ব্যাগ — ₹৭৫")}</li>
                <li>{t("Full tiffin kit replacement — ₹250", "সম্পূর্ণ টিফিন কিট — ₹২৫০")}</li>
              </ul>
            </li>
            <li>
              {t(
                "On exit: remaining meal balance + security deposit (less any damages) are refunded.",
                "সাবস্ক্রিপশন বন্ধ করলে বাকি মিল ব্যালান্স + জামানত (যদি ক্ষতি না হয়) ফেরত দেওয়া হবে।",
              )}
            </li>
            <li>
              {t(
                "A photo may be required to record a damage charge.",
                "ক্ষতির চার্জ রেকর্ড করতে একটি ছবি দরকার হতে পারে।",
              )}
            </li>
          </ol>
          <label className="flex gap-2 mt-3 items-start">
            <input type="checkbox" name="agree" required className="mt-[3px]" />
            <span className="text-[12px] text-bhuk-ink font-semibold">
              {t("I have read and agree to the terms.", "আমি শর্তাবলী পড়েছি ও সম্মত আছি।")}
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-[14px] border-0 bg-bhuk-maroon text-white font-extrabold text-[14px] rounded-[11px] cursor-pointer disabled:opacity-60"
        >
          {isPending
            ? t("Submitting…", "জমা হচ্ছে…")
            : t("Submit subscription request", "সাবস্ক্রিপশন রিকোয়েস্ট জমা দিন")}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  hint,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-[12.5px] font-bold text-bhuk-ink2 mb-1">
        {label}
        {required ? <span className="text-bhuk-terra"> *</span> : null}
      </label>
      {children}
      {hint ? <div className="text-[11px] text-bhuk-off-ink mt-1">{hint}</div> : null}
      {error ? <div className="text-[11px] text-bhuk-terra mt-1">{error}</div> : null}
    </div>
  );
}

function Input({
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={`w-full px-[13px] py-[11px] border-[1.5px] border-bhuk-line rounded-[10px] text-[14px] bg-white outline-none focus:border-bhuk-maroon ${className}`}
    />
  );
}

function Textarea({
  className = "",
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={`w-full px-[13px] py-[10px] border-[1.5px] border-bhuk-line rounded-[10px] text-[14px] bg-white outline-none focus:border-bhuk-maroon ${className}`}
    />
  );
}

function Select({
  className = "",
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={`w-full px-[10px] py-[11px] border-[1.5px] border-bhuk-line rounded-[10px] text-[14px] bg-white outline-none focus:border-bhuk-maroon ${className}`}
    >
      {children}
    </select>
  );
}

function Radio({
  name,
  value,
  label,
  checked,
  onChange,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  checked?: boolean;
  onChange?: () => void;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        defaultChecked={defaultChecked}
      />
      <span className="text-[13px] text-bhuk-ink">{label}</span>
    </label>
  );
}
