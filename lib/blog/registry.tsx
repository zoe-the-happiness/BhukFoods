import type { ReactNode } from "react";

/**
 * Bhuk Foods blog registry. Each post is rendered as JSX so we don't need an
 * MDX pipeline. Add a new entry at the top to publish.
 */

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string; // yyyy-MM-dd, IST
  readMinutes: number;
  body: () => ReactNode;
};

const SITE_URL = "https://www.bhukfoods.com";

export const POSTS: Post[] = [
  {
    slug: "stop-cooking-start-living",
    title: "Stop cooking, start living — why we built Bhuk Foods",
    excerpt:
      "A founder's note on India's first kitchen substitution service, the BLPGA kitchen at 43 Matangini Hazra Pally, and why we don't call ourselves a tiffin service.",
    publishedAt: "2026-05-25",
    readMinutes: 4,
    body: () => (
      <>
        <Lede>
          You should not have to choose between studying for an exam and standing over a
          gas stove. That's the founding premise of Bhuk Foods.
        </Lede>
        <P>
          I run a paying-guest house in Agarpara — BLPGA, at 43, Matangini Hazra Pally. Every
          year I see the same arc: a student moves in, eats out for a week, decides street
          food is unsustainable, buys a small induction cooker, cooks twice, gets tired,
          orders Zomato, runs out of money, and ends up living on Maggi for the last week
          of the month. Their phones light up with delivery promos and their bodies pay
          for it.
        </P>
        <P>
          We didn't build a tiffin service. Tiffin services hand you a steel box once a
          day and call it done. We built a <Em>kitchen substitution service</Em>. The job is
          to remove cooking from your life entirely — for the price of one month's groceries,
          done well, done daily, done close enough that the food is still warm.
        </P>
        <H2>What that means concretely</H2>
        <UL>
          <LI>
            Two meals a day, Monday through Saturday. Brunch between 8:30 and 10. Dinner
            between 6 and 8.
          </LI>
          <LI>
            A 7-day rotation so it doesn't feel like the same plate. Chicken on Mon and
            Wed, fish on Tue and Sat, paneer on Thu, eggs on Fri. Air fryer everywhere we
            can — less oil, fewer hidden costs to your body.
          </LI>
          <LI>
            One transparent number: ₹100 per meal day. ₹2,600 buys 26 meal days. No
            surge pricing, no platform fee, no "service tax" line at the bottom.
          </LI>
          <LI>
            A 4 PM cutoff the day before for skips. Going home for the weekend? Tap the
            day in the app before 4 PM the previous day and your plan extends — no charge,
            no negotiation.
          </LI>
        </UL>
        <H2>Why a PG owner is doing this</H2>
        <P>
          I have the kitchen. I have the FSSAI registration (no.&nbsp;22825131000756). I have a
          cook who has been making food in this neighbourhood for 18 years, longer than
          some of you have been alive. And I have a tenant base who, every year, ends up
          paying more than ₹2,600 a month to eat worse. The math is too obvious to ignore.
        </P>
        <P>
          We're starting with the students of NIT Agarpara and JIS University because
          you're our neighbours — five minutes' walk. If it works for you, it works for
          anyone in north Kolkata who has decided that cooking is not how they want to
          spend their twenties.
        </P>
        <H2>Stop cooking, start living</H2>
        <P>
          That tagline is not marketing. It's the deal. You pay us once a month, we feed
          you twice a day, and you get back the two hours a day that you used to spend on
          groceries and washing up. Use them to read, to sleep, to call your parents, to
          finish your project, to walk to the riverside at sunset. We'll handle the food.
        </P>
        <P className="text-bhuk-off-ink text-[12px] mt-6">
          — Nirmalya Ranjan Sarkar · Agarpara, 25 May 2026
        </P>
      </>
    ),
  },

  {
    slug: "what-is-kitchen-substitution",
    title: "What is a kitchen substitution service?",
    excerpt:
      "Not a tiffin service. Not a cloud kitchen. Not a meal-kit subscription. A kitchen substitution service replaces the entire act of cooking — and that changes the math.",
    publishedAt: "2026-05-25",
    readMinutes: 5,
    body: () => (
      <>
        <Lede>
          A tiffin service drops off a meal. A meal kit drops off ingredients. A kitchen
          substitution service drops off your kitchen.
        </Lede>
        <P>
          We use the phrase because nothing else fits cleanly. Let's walk through the
          options and why each falls short.
        </P>
        <H2>Tiffin service</H2>
        <P>
          You pay a bhaiya for a steel box once a day, usually lunch. The menu rotates a
          little, the rice is always the same, the curry is never the same temperature
          twice in a row, and the bhaiya disappears around exam week. You're still
          shopping for dinner. The kitchen is still in your hand at 8 PM.
        </P>
        <H2>Cloud kitchen / Swiggy-Zomato</H2>
        <P>
          You pay ₹250–₹350 per meal once you account for delivery, packaging, and
          platform fees. You eat fried food, because fried food is what the unit economics
          push restaurants towards. You promise yourself you'll cook tomorrow. Tomorrow,
          there are exams.
        </P>
        <H2>Meal kits</H2>
        <P>
          You receive pre-portioned ingredients and "20-minute recipes." You still cook.
          You still wash up. You also pay for the same milk that's in your fridge.
        </P>
        <H2>Kitchen substitution</H2>
        <P>
          You hand over the responsibility, not just the cooking. We grocery-shop daily
          for fresh produce. We bring our own steel containers (₹250 refundable deposit
          covers them). We deliver brunch and dinner six days a week. We absorb the days
          you skip — no charge, your plan just runs longer. The only thing left in your
          hand is your spoon.
        </P>
        <H2>Why the distinction matters</H2>
        <P>
          When you frame the problem as "I need food," the answer is a delivery app. When
          you frame it as "I need a kitchen," the answer is different — fewer choices,
          deeper trust, a real relationship with the cook, and a price that holds for a
          full month.
        </P>
        <P>
          Bhuk Foods has 26 meal days × 2 plates a day = 52 plates for ₹2,600. That's
          ₹50 a plate. There is no kitchen substitution at that price anywhere in north
          Kolkata, and we'd know — we walked it.
        </P>
      </>
    ),
  },

  {
    slug: "the-four-pm-rule",
    title: "The 4 PM rule — how skip-a-day works without losing a rupee",
    excerpt:
      "Cancel any meal day before 4 PM the previous day and you're not charged. The day extends to the end of your plan. Here's why the rule is exactly this strict, and exactly this generous.",
    publishedAt: "2026-05-25",
    readMinutes: 4,
    body: () => (
      <>
        <Lede>
          The cook needs to know how many plates to make by ~4:30 PM the day before. So the
          customer's window closes at 4:00. Thirty minutes of slack is for emergencies.
        </Lede>
        <P>
          Most meal subscriptions either don't let you skip at all, or let you skip
          with a "we'll adjust later" promise that quietly gets lost. We did it
          differently because it directly answers the only real objection to monthly
          plans: <Em>what if I'm not eating that day?</Em>
        </P>
        <H2>How it works in the app</H2>
        <OL>
          <LI>
            Open the customer console at <Link href="/customer">bhukfoods.com/customer</Link>.
          </LI>
          <LI>Tap the green day you'll be away.</LI>
          <LI>Confirm. The day flips to dashed-outline.</LI>
          <LI>That day is not charged. Your "Plan ends" date moves one day forward.</LI>
        </OL>
        <H2>What 4 PM IST actually does</H2>
        <P>
          At 4 PM, our database refuses any new cancellation for tomorrow. (It's enforced
          inside Postgres, not just in the front end — so a smart customer with a Chrome
          dev console can't bypass it.) At 4:30, the kitchen prints the final headcount
          sheet for tomorrow. By dinner, the cook has bought tomorrow's vegetables.
        </P>
        <H2>Edge cases we thought through</H2>
        <UL>
          <LI>
            <B>Forgot to cancel?</B> The day is locked. We made the meal. If you don't
            collect it, that's our cost — we don't double-charge you next month, but the
            cook still bought the rice. The 4 PM rule exists so this doesn't happen often.
          </LI>
          <LI>
            <B>Cancelled, then changed your mind?</B> You can un-cancel from the same
            calendar screen <Em>while the 4 PM window is still open</Em>. After 4 PM, the
            cook has already counted, and we'd rather not pull a fast one on her.
          </LI>
          <LI>
            <B>Genuine emergency after 4 PM?</B> Call us on 7595923777. Admin has a small
            30-minute grace window to mark a customer off without a charge. We use it
            sparingly. Don't make it a habit and we'll never say no.
          </LI>
        </UL>
        <H2>Why this is fair to both sides</H2>
        <P>
          The cook's daily life is calmer because she knows the number by dinner. The
          customer's wallet is calmer because they don't pay for food they didn't eat.
          The plan still gives you all 26 meal days a month — they just shift forward.
          You don't lose a rupee. You don't even lose a meal. You just lose the meal day
          you were going to skip anyway.
        </P>
      </>
    ),
  },

  {
    slug: "inside-the-kitchen",
    title: "Inside the BLPGA kitchen — air fryer, FSSAI, daily groceries",
    excerpt:
      "What it actually looks like at 43, Matangini Hazra Pally at 6 AM. Why we cook in an air fryer. Why we shop every morning. Why our FSSAI registration is on the wall.",
    publishedAt: "2026-05-25",
    readMinutes: 5,
    body: () => (
      <>
        <Lede>
          Our kitchen has three rules. Fresh that morning. Air fryer wherever possible.
          One cook who has done this for 18 years.
        </Lede>
        <H2>Fresh that morning</H2>
        <P>
          The cook walks to the BSS Road market at 6 AM with a fabric bag and an idea
          of what 23 students need today. She buys two days' worth of dry goods (dal,
          rice, oil), but vegetables only for that day. Pointed gourd that was on a vine
          yesterday is in your rice today. Rohu was in the river two evenings ago. The
          fridge in our kitchen is small on purpose — we don't store, we cook.
        </P>
        <H2>Air fryer wherever possible</H2>
        <P>
          We deep-fry exactly one thing: special-occasion luchis on Thursday. Everything
          else that <Em>looks</Em> fried is air-fried — pointed gourd, brinjal, fish for
          curry, even bhujia. Same crunch, a tenth the oil. Reasonable per-meal cost
          stays reasonable; your body thanks you in the long run.
        </P>
        <H2>One cook</H2>
        <P>
          Her name is on the door of the kitchen, and her display name in our app is
          "Cook 1" because she is the one who set the standard. Eighteen years of
          cooking in this neighbourhood; she knows what each student likes, who can't do
          spice, who's allergic to dairy. As we add a second kitchen we will add a
          second cook — but every kitchen has exactly one person responsible for
          the food, by name.
        </P>
        <H2>FSSAI, Trade Licence, MSME — why we display the numbers</H2>
        <P>
          Most home kitchens that "do tiffin" in India operate informally. That's fine
          for them; it's not fine for the parent in Burdwan who is wiring money for
          their child's food. So we registered everything and we put the numbers on the
          footer of every page of this site:
        </P>
        <UL>
          <LI>FSSAI Registration No. <Mono>22825131000756</Mono></LI>
          <LI>Trade Licence / CE No. <Mono>0917P3084125375816</Mono></LI>
          <LI>MSME Registration No. <Mono>UDYAM-WB-14-0087932</Mono></LI>
        </UL>
        <P>
          If anything ever goes wrong, you have something to point at. We hope you never
          have to.
        </P>
        <H2>Where the kitchen is</H2>
        <P>
          BLPGA, 43, Matangini Hazra Pally, Agarpara, Kolkata 700109.
          {" "}
          <A href="https://maps.app.goo.gl/Nans91VKu2FLVRFw5">Open in Google Maps</A>{" "}
          or punch in the Plus code <Mono>M9JH+JX Kolkata</Mono>.
        </P>
        <P>
          Five minutes from NIT Agarpara's main gate. Eight from JIS. If you're a
          parent visiting your child for the first time, stop by — we'll put the kettle on.
        </P>
      </>
    ),
  },

  {
    slug: "rupees-100-per-meal-economics",
    title: "₹100 per meal day, broken down",
    excerpt:
      "Where the money goes. Ingredients, cook, gas, packaging, delivery, deposit. A line-by-line walkthrough of how a one-rupee meal would not work and why ₹100 does.",
    publishedAt: "2026-05-25",
    readMinutes: 4,
    body: () => (
      <>
        <Lede>
          ₹2,600 for 26 meal days is ₹100 per day for two meals. The arithmetic is
          deliberate, not aspirational.
        </Lede>
        <H2>What ₹100 buys you</H2>
        <UL>
          <LI>
            <B>Brunch (~₹50):</B> 200–250g of cooked rice, a generous cup of dal, the
            protein of the day (chicken / fish / paneer / egg) with curry, plus a
            seasonal vegetable side. Always served between 8:30 and 10 AM.
          </LI>
          <LI>
            <B>Dinner (~₹50):</B> Four hot rotis, a seasonal vegetable curry, and an egg
            (boiled, omelette, or bhujia depending on the day). Thursday dinner is the
            "special": pulao + dum aloo or rajma + roti.
          </LI>
        </UL>
        <H2>Where ₹100 goes (ballpark, per meal day)</H2>
        <Mono className="block bg-bhuk-cream rounded-[10px] p-3 my-3 text-[12.5px] whitespace-pre">
{`Ingredients (groceries, daily fresh)   ₹52
Cook + helper labour                   ₹22
Gas + electricity + air-fryer power    ₹6
Container wear, packaging, replacement ₹4
Delivery fuel (BLPGA = ₹0)             ₹0–25
Kitchen overhead (rent share, water)   ₹8
─────────────────────────────────────────────
                                       ₹92–117`}
        </Mono>
        <P>
          That's the operator-side picture. For a BLPGA-resident customer, ₹100 lands
          inside the band with a thin margin for the business. For home-delivery
          customers we quote a per-day delivery fee on top of the ₹100 — typically ₹20–₹40
          depending on distance — because we'd rather be transparent than pretend
          delivery is free.
        </P>
        <H2>What ₹100 explicitly doesn't pay for</H2>
        <UL>
          <LI>Marketing spend on Zomato-style listings. We have a website. You found us.</LI>
          <LI>A 15% "convenience charge" that appears at checkout.</LI>
          <LI>Aggregator margins to Swiggy / Zomato / Magicpin.</LI>
          <LI>Surge pricing during exam week. The rate is flat, in writing, for the month.</LI>
        </UL>
        <H2>The ₹250 deposit</H2>
        <P>
          Self-pickup and home-delivery customers leave a one-time, refundable ₹250
          deposit — that covers a small tiffin container (₹25), a medium (₹50), a lid
          (₹50), a large (₹100), and the carrier bag (₹75). Lose anything, the cost
          comes out of the deposit and we email you a photo of what broke. Hand the
          containers back clean on exit and the full ₹250 returns to your UPI.
        </P>
        <H2>Why we don't go lower</H2>
        <P>
          We could cut the protein in half and serve ₹70 meals. We could go fully veg
          and serve ₹60 meals. We have chosen not to, because we'd rather feed 23
          students well than 50 students badly. If we ever raise the price, you'll see
          the breakdown change first, and you'll know exactly why.
        </P>
      </>
    ),
  },

  {
    slug: "mon-to-sat-never-sunday",
    title: "Mon to Sat, never Sunday — why the cook gets a day off",
    excerpt:
      "Many tiffin services boast 7-day delivery. We don't. Here's the case for a six-day kitchen, why your plan is priced for it, and how it actually makes the other six days better.",
    publishedAt: "2026-05-25",
    readMinutes: 3,
    body: () => (
      <>
        <Lede>
          Six days of cooking with one person at the stove is sustainable. Seven days is
          how cooks burn out by month four. We chose Mon–Sat on purpose.
        </Lede>
        <H2>The cook is a human</H2>
        <P>
          A working cook who is on the stove from 7 AM and 4 PM every single day has no
          time for groceries, laundry, family, doctor, temple, anything. Six days a week
          is the maximum a kitchen can run sustainably without quality slipping. The
          easiest way to ruin a tiffin service is to run it seven days. Look up the
          ones that tried.
        </P>
        <H2>Your plan is priced for it</H2>
        <P>
          We don't charge for Sunday and we don't pretend we do. 26 service days × 2 meals
          = 52 meals for ₹2,600. The math assumes weeks of (Mon, Tue, Wed, Thu, Fri,
          Sat) only. There's no missing day; there's no asterisk. Some plans claim
          "30 days" but quietly skip Sundays and holidays — you find out month three.
        </P>
        <H2>Sunday is actually useful</H2>
        <UL>
          <LI>
            <B>For you:</B> One day a week to go out with friends, eat your mother's
            cooking when she visits, or remember what cooking your own meal feels like
            (you'll choose us by Monday morning, trust us).
          </LI>
          <LI>
            <B>For the kitchen:</B> One full day for deep-cleaning, repairing the air
            fryer, restocking dry goods at the wholesaler, and inventing the next
            month's specials.
          </LI>
          <LI>
            <B>For the cook:</B> Time to actually live.
          </LI>
        </UL>
        <H2>What about exam-week heroism?</H2>
        <P>
          We don't do 7-day "exam specials." We do the opposite — during exam weeks the
          dinner skews lighter (less heavy oil, more dal-rice, more eggs, fewer carbs)
          because we'd rather you finished the paper than slept through it. Sunday off
          is part of how we keep the other six days good.
        </P>
      </>
    ),
  },
];

/* ------------------------------------------------------------------------ */
/* Tiny styled primitives so blog bodies stay tidy.                          */
/* ------------------------------------------------------------------------ */

function Lede({ children }: { children: ReactNode }) {
  return (
    <p className="text-[16px] leading-relaxed text-bhuk-ink2 italic border-l-[3px] border-bhuk-saffron pl-3 mb-4">
      {children}
    </p>
  );
}
function P({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[14.5px] leading-relaxed text-bhuk-ink2 my-3 ${className}`}>{children}</p>;
}
function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-serif font-bold text-[20px] text-bhuk-maroon mt-6 mb-2 -tracking-[0.2px]">
      {children}
    </h2>
  );
}
function UL({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-5 my-3 space-y-1.5 text-[14.5px] leading-relaxed text-bhuk-ink2">{children}</ul>;
}
function OL({ children }: { children: ReactNode }) {
  return <ol className="list-decimal pl-5 my-3 space-y-1.5 text-[14.5px] leading-relaxed text-bhuk-ink2">{children}</ol>;
}
function LI({ children }: { children: ReactNode }) {
  return <li className="pl-1">{children}</li>;
}
function Em({ children }: { children: ReactNode }) {
  return <em className="text-bhuk-ink font-semibold not-italic">{children}</em>;
}
function B({ children }: { children: ReactNode }) {
  return <strong className="text-bhuk-ink font-extrabold">{children}</strong>;
}
function Mono({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <code className={`font-mono text-[13px] text-bhuk-maroon ${className}`}>{children}</code>;
}
function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-bhuk-terra font-bold underline underline-offset-2">
      {children}
    </a>
  );
}
function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-bhuk-terra font-bold underline underline-offset-2">
      {children}
    </a>
  );
}

export function postBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function siteUrlForPost(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}
