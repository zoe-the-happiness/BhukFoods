/**
 * JSON-LD structured data for SEO. Rendered once on the landing page.
 *
 * - LocalBusiness + FoodEstablishment for the kitchen
 * - FAQPage with the questions duplicated from components/landing/faq.tsx
 */
export function LandingJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "FoodEstablishment"],
        "@id": "https://www.bhukfoods.com/#business",
        name: "Bhuk Foods",
        url: "https://www.bhukfoods.com/",
        telephone: "+91-7595923777",
        email: "hello@bhukfoods.com",
        priceRange: "₹₹",
        servesCuisine: ["Bengali", "Indian"],
        address: {
          "@type": "PostalAddress",
          streetAddress: "43, Matangini Hazra Pally",
          addressLocality: "Agarpara",
          addressRegion: "West Bengal",
          postalCode: "700109",
          addressCountry: "IN",
        },
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
        openingHours: ["Mo-Sa 10:00-22:00"],
        paymentAccepted: ["Cash", "UPI", "Bank Transfer"],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How much does a Bhuk Foods monthly tiffin cost?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Bhuk Foods costs ₹2,600 per month for two meals a day — brunch and dinner — Monday to Saturday, prepaid. Sunday is always off. ₹100 = one meal day. BLPGA residents and self-pickup customers pay no delivery; home delivery is quoted at signup.",
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
              text: "Home-style Bengali food. Brunch is rice with dal, a main dish (rotating chicken, fish, paneer, egg) and a vegetable side. Dinner is roti with a seasonal vegetable curry and boiled or omelette egg. Thursday dinner is special pulao or rajma. All frying is done in an air fryer.",
            },
          },
          {
            "@type": "Question",
            name: "Is Bhuk Foods FSSAI registered?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Bhuk Foods is registered with FSSAI. The licence number is displayed in the app and on every meal package.",
            },
          },
        ],
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
