/**
 * Bhuk Foods photo registry.
 *
 * All 15 are hosted on ImageKit. We attach ?tr= transformations on the fly
 * so each slot loads the right size + quality. Replace any slot value with
 * a different photo and the change propagates everywhere it's referenced.
 */

const BASE = [
  "https://ik.imagekit.io/bhukfoods/ztsj5vrms4zkklqsgcdm.webp?updatedAt=1773971131277",
  "https://ik.imagekit.io/bhukfoods/bq6dl0nvdkrr1zetwswq.webp?updatedAt=1773971131267",
  "https://ik.imagekit.io/bhukfoods/bhay2c1v5evwmuh1i6sz.webp?updatedAt=1773971131200",
  "https://ik.imagekit.io/bhukfoods/jnrwe9l0sle0s1euvsy1.webp?updatedAt=1773971131215",
  "https://ik.imagekit.io/bhukfoods/b4mzzdgbtq2ius3fegxq.webp?updatedAt=1773971131209",
  "https://ik.imagekit.io/bhukfoods/fzg80fj3i2twuv00apsq.webp?updatedAt=1773971109375",
  "https://ik.imagekit.io/bhukfoods/zfuandeodmllgwheuvle.webp?updatedAt=1773971109365",
  "https://ik.imagekit.io/bhukfoods/ke5zii30kal0tq1mcgpo.webp?updatedAt=1773971109321",
  "https://ik.imagekit.io/bhukfoods/vyyqdrmy3qxttofsazfz.webp?updatedAt=1773971109247",
  "https://ik.imagekit.io/bhukfoods/t03ojolcgs0aqozqnyrr.webp?updatedAt=1773971109249",
  "https://ik.imagekit.io/bhukfoods/ge8jfam25pfcliy9utav.webp?updatedAt=1773971109265",
  "https://ik.imagekit.io/bhukfoods/ufnxkkeyrcfh2bu9yhcq.webp?updatedAt=1773971108525",
  "https://ik.imagekit.io/bhukfoods/jdhflavajxms6uulnqh5.webp?updatedAt=1773971108421",
  "https://ik.imagekit.io/bhukfoods/dt2qsyvl41nsbpiefzpy.webp?updatedAt=1773971108351",
  "https://ik.imagekit.io/bhukfoods/eoivn2kpydmcrqmihiey.webp?updatedAt=1773971108346",
] as const;

/**
 * Named slots — change the index on any of these to recurate which photo
 * appears in which surface. The actual file URLs stay in BASE.
 */
export const PHOTOS = {
  // Landing hero (large, behind text)
  hero: BASE[0],

  // 4 menu cards: Mon / Tue / Thu (special) / Sat
  menuMon: BASE[1],
  menuTue: BASE[2],
  menuThu: BASE[3],
  menuSat: BASE[4],

  // "From the kitchen" gallery strip (any number; we render in order)
  kitchen: [BASE[5], BASE[6], BASE[7], BASE[8], BASE[9], BASE[10]] as const,

  // Blog post heroes — keyed by slug
  blogHero: {
    "stop-cooking-start-living": BASE[11],
    "what-is-kitchen-substitution": BASE[2],
    "the-four-pm-rule": BASE[12],
    "inside-the-kitchen": BASE[13],
    "rupees-100-per-meal-economics": BASE[3],
    "mon-to-sat-never-sunday": BASE[14],
  } as Record<string, string>,
} as const;

/** Add ImageKit ?tr= transformations to an existing URL, preserving other query params. */
export function ik(url: string, transform: string): string {
  // ImageKit's tr= must be the first query parameter for some CDNs; appending
  // works fine for the canonical ik.imagekit.io endpoint.
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}tr=${transform}`;
}

/** Common sizes. */
export const IK = {
  hero: "w-1600,q-78,f-auto",
  card: "w-640,q-78,f-auto",
  thumb: "w-480,q-78,f-auto",
  blogHero: "w-1400,q-78,f-auto",
  heroBg: "w-1800,q-70,f-auto",
} as const;

/**
 * Background carousel for the landing hero. 7 images, each shown ~5s out
 * of a 35s loop with a 1s crossfade overlap. Order matters — change here
 * and the rotation order updates everywhere.
 */
export const HERO_CAROUSEL = [
  "https://ik.imagekit.io/bhukfoods/bq6dl0nvdkrr1zetwswq.webp?updatedAt=1773971131267",
  "https://ik.imagekit.io/bhukfoods/t03ojolcgs0aqozqnyrr.webp?updatedAt=1773971109249",
  "https://ik.imagekit.io/bhukfoods/ufnxkkeyrcfh2bu9yhcq.webp?updatedAt=1773971108525",
  "https://ik.imagekit.io/bhukfoods/ge8jfam25pfcliy9utav.webp?updatedAt=1773971109265",
  "https://ik.imagekit.io/bhukfoods/ke5zii30kal0tq1mcgpo.webp?updatedAt=1773971109321",
  "https://ik.imagekit.io/bhukfoods/vyyqdrmy3qxttofsazfz.webp?updatedAt=1773971109247",
  "https://ik.imagekit.io/bhukfoods/eoivn2kpydmcrqmihiey.webp?updatedAt=1773971108346",
] as const;
