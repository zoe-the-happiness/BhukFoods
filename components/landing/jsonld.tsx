import { MENU_ROTATION } from "@/lib/menu";
import { REVIEWS } from "@/lib/reviews";

const SITE = "https://www.bhukfoods.com";
const LOGO_URL =
  "https://ik.imagekit.io/bhukfoods/Logo/Logo%2020260523%201951_Trans.webp";

/**
 * Landing-page structured data — emitted once in the document head so search
 * engines + generative AI engines (ChatGPT, Gemini, Claude, Perplexity) can
 * parse Bhuk Foods as a rich entity.
 *
 * Graph entities:
 *   - Organization      Bhuk Foods as the legal entity
 *   - LocalBusiness     The kitchen at 43 Matangini Hazra Pally
 *     + Restaurant      (multi-type) so menu + cuisine are picked up
 *     + FoodEstablishment
 *     + aggregateRating  5.0 / 10 Google reviews
 *     + review[]         each review as a Person + 5-star rating
 *     + hasMenu          Mon–Sat brunch + dinner rotation
 *     + makesOffer       monthly subscription with delivery tiers
 *     + areaServed[]     6 north-Kolkata localities
 *     + openingHoursSpecification
 *   - Service           the monthly kitchen-substitution subscription
 *   - FAQPage           the 8 user FAQs from the landing accordion
 *   - WebSite           with SearchAction so engines can surface site search
 */
export function LandingJsonLd() {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const menuSections = Object.entries(MENU_ROTATION)
    .filter(([, m]) => m !== null)
    .map(([dow, m]) => ({
      "@type": "MenuSection",
      name: `${days[Number(dow)]} (brunch + dinner)`,
      hasMenuItem: [
        { "@type": "MenuItem", name: `Brunch — ${m!.brunch_en}` },
        { "@type": "MenuItem", name: `Dinner — ${m!.dinner_en}` },
      ],
    }));

  const reviews = REVIEWS.map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.name },
    reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
    publisher: { "@type": "Organization", name: "Google" },
    url: r.reviewUrl,
  }));

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      // Organization
      {
        "@type": "Organization",
        "@id": `${SITE}/#org`,
        name: "Bhuk Foods",
        alternateName: "BhukFoods",
        url: SITE,
        logo: LOGO_URL,
        email: "bhukfoods@gmail.com",
        telephone: "+91-7595923777",
        slogan: "Stop cooking, start living.",
        founder: { "@type": "Person", name: "Nirmalya Ranjan Sarkar" },
        sameAs: [
          "https://www.instagram.com/bhukfoods/",
          "https://www.facebook.com/profile.php?id=61582663376504",
          "https://www.youtube.com/@BhukFoods",
        ],
      },

      // Local business / restaurant / food establishment
      {
        "@type": ["LocalBusiness", "Restaurant", "FoodEstablishment"],
        "@id": `${SITE}/#business`,
        name: "Bhuk Foods",
        description:
          "India's first kitchen substitution service. Home-style Bengali monthly meal subscription delivered in Agarpara. Two meals a day, Mon–Sat, ₹2,600/month. FSSAI-registered kitchen at 43, Matangini Hazra Pally.",
        url: SITE,
        image: [LOGO_URL],
        logo: LOGO_URL,
        telephone: "+91-7595923777",
        email: "bhukfoods@gmail.com",
        priceRange: "₹₹",
        servesCuisine: ["Bengali", "Indian", "Home-style"],
        currenciesAccepted: "INR",
        paymentAccepted: ["Cash", "UPI", "Bank Transfer"],
        smokingAllowed: false,
        address: {
          "@type": "PostalAddress",
          streetAddress: "BLPGA, 43, Matangini Hazra Pally",
          addressLocality: "Agarpara",
          addressRegion: "West Bengal",
          postalCode: "700109",
          addressCountry: "IN",
        },
        geo: { "@type": "GeoCoordinates", latitude: 22.6816, longitude: 88.3799 },
        areaServed: [
          "Agarpara",
          "Sodepur",
          "Khardah",
          "Panihati",
          "Belghoria",
          "Kamarhati",
          "NIT Agarpara",
          "JIS University Agarpara",
        ],
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "08:00",
            closes: "21:00",
          },
        ],
        hasMenu: {
          "@type": "Menu",
          name: "Bhuk Foods seven-day rotation",
          hasMenuSection: menuSections,
        },
        makesOffer: {
          "@type": "Offer",
          name: "Monthly Bhuk Foods subscription",
          description:
            "Two home-style Bengali meals a day, Monday to Saturday, prepaid for one month.",
          price: "2600",
          priceCurrency: "INR",
          eligibleQuantity: { "@type": "QuantitativeValue", value: 26, unitText: "service days" },
          availability: "https://schema.org/InStock",
          url: `${SITE}/join`,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "5.0",
          reviewCount: String(REVIEWS.length),
          bestRating: "5",
          worstRating: "1",
        },
        review: reviews,
        parentOrganization: { "@id": `${SITE}/#org` },
        identifier: [
          { "@type": "PropertyValue", name: "FSSAI Registration", value: "22825131000756" },
          { "@type": "PropertyValue", name: "Trade Licence", value: "0917P3084125375816" },
          { "@type": "PropertyValue", name: "MSME Registration", value: "UDYAM-WB-14-0087932" },
        ],
      },

      // Service / subscription
      {
        "@type": "Service",
        "@id": `${SITE}/#subscription`,
        serviceType: "Kitchen substitution service",
        name: "Bhuk Foods monthly meal subscription",
        description:
          "Prepaid monthly home-style Bengali meal subscription. Two meals a day, Mon–Sat, with free delivery to BLPGA residents and quoted delivery to nearby Agarpara, Sodepur, Khardah, Panihati, Belghoria and Kamarhati addresses.",
        provider: { "@id": `${SITE}/#business` },
        areaServed: { "@type": "City", name: "Kolkata north suburbs" },
        offers: {
          "@type": "Offer",
          price: "2600",
          priceCurrency: "INR",
          url: `${SITE}/join`,
        },
      },

      // FAQ
      {
        "@type": "FAQPage",
        "@id": `${SITE}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What is the monthly cost of Bhuk Foods tiffin?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Two prepaid meals a day, Monday to Saturday. Sunday is always off. Delivery is free for BLPGA residents and self-pickup; home delivery is quoted at signup. The current monthly figure, delivery tiers, and refundable security deposit are listed in the Pricing section of the landing page.",
            },
          },
          {
            "@type": "Question",
            name: "Is there a tiffin service near Narula Institute of Technology Agarpara?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Bhuk Foods is located at 43, Matangini Hazra Pally, about 5 minutes from NIT Agarpara and JIS University. We deliver to students living in PGs and rented rooms in Agarpara, Sodepur, Khardah, Panihati, Belghoria and Kamarhati.",
            },
          },
          {
            "@type": "Question",
            name: "Can I cancel a meal day if I am travelling home?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Cancel any meal day from the app before 4 PM the previous day. The cancelled day is not charged. Your balance funds a later day, so your plan extends at the end. After 4 PM the next day is locked.",
            },
          },
          {
            "@type": "Question",
            name: "What food does Bhuk Foods serve?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Home-style Bengali food on a seven-day rotation. Brunch is rice with dal, a main dish (chicken Mon and Wed, fish Tue and Sat, paneer Thu, egg Fri) and a vegetable side. Dinner is rice or four rotis with a seasonal vegetable curry and an egg. Thursday dinner is special pulao or rajma. All frying is done in an air fryer.",
            },
          },
          {
            "@type": "Question",
            name: "What are the meal timings?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Brunch between 8:00 AM and 10:00 AM. Dinner between 6:00 PM and 9:00 PM. Service runs Monday to Saturday. Sunday is always off.",
            },
          },
          {
            "@type": "Question",
            name: "Is Bhuk Foods FSSAI registered?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Bhuk Foods runs a FSSAI-registered kitchen at 43, Matangini Hazra Pally, Agarpara. FSSAI Registration No. 22825131000756. Trade Licence 0917P3084125375816. MSME Registration UDYAM-WB-14-0087932.",
            },
          },
        ],
      },

      // Website + search action
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: SITE,
        name: "Bhuk Foods",
        publisher: { "@id": `${SITE}/#org` },
        inLanguage: ["en-IN", "bn-IN"],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
