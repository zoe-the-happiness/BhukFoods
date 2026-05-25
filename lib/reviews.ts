/**
 * Google Business Profile reviews. Each screenshot is hosted on ImageKit;
 * each link points at the canonical share URL on share.google.
 *
 * Add new rows at the top and they appear in the carousel automatically.
 */

export type Review = {
  name: string;
  reviewUrl: string;
  imageUrl: string;
};

export const REVIEWS: Review[] = [
  {
    name: "Preeti",
    reviewUrl: "https://share.google/HCwyHt2dFRBH5m9En",
    imageUrl:
      "https://ik.imagekit.io/bhukfoods/Reviews/Screenshot%202026-05-24%20at%2012.33.29.webp",
  },
  {
    name: "Tanmay Saha",
    reviewUrl: "https://share.google/OFim0wavlK7JOjYaw",
    imageUrl: "https://ik.imagekit.io/bhukfoods/Reviews/pkjwbiqwpzwdvwtfbe7e.webp",
  },
  {
    name: "Ipi",
    reviewUrl: "https://share.google/OFim0wavlK7JOjYaw",
    imageUrl: "https://ik.imagekit.io/bhukfoods/Reviews/kdcgox0fksyrjh0c3qi2.webp",
  },
  {
    name: "Kipa",
    reviewUrl: "https://share.google/OFim0wavlK7JOjYaw",
    imageUrl: "https://ik.imagekit.io/bhukfoods/Reviews/gkejdifkjvuwpxx1acru.webp",
  },
  {
    name: "Riya",
    reviewUrl: "https://share.google/KXrHvkt8NDxYKAz4y",
    imageUrl: "https://ik.imagekit.io/bhukfoods/Reviews/feh1r6s1w0ysgqkmjgod.webp",
  },
  {
    name: "Sudeshna",
    reviewUrl: "https://share.google/inlOddLHiYxiU8haQ",
    imageUrl: "https://ik.imagekit.io/bhukfoods/Reviews/szeac1lymdjjkajiv3h3.webp",
  },
  {
    name: "Srishti",
    reviewUrl: "https://share.google/KXrHvkt8NDxYKAz4y",
    imageUrl: "https://ik.imagekit.io/bhukfoods/Reviews/imkmvwt9mglgqg7hgitx.webp",
  },
  {
    name: "Bhumi",
    reviewUrl: "https://share.google/VDWW0oOU3PNN8ELF0",
    imageUrl: "https://ik.imagekit.io/bhukfoods/Reviews/fqinjwjkrbototu4oixj.webp",
  },
  {
    name: "Aditi",
    reviewUrl: "https://share.google/43oZ9qh5pN6UWO5aM",
    imageUrl: "https://ik.imagekit.io/bhukfoods/Reviews/ko5atuvp318rqqcvb2q3.webp",
  },
  {
    name: "Mansi",
    reviewUrl: "https://share.google/cqmQoEwm8k2sv6QHX",
    imageUrl: "https://ik.imagekit.io/bhukfoods/Reviews/cpecq0em4b7t6olo3l7p.webp",
  },
];

/** Profile of the Bhuk Foods Google Business listing — used for "Read more" link. */
export const GOOGLE_BUSINESS_URL = "https://share.google/HCwyHt2dFRBH5m9En";
