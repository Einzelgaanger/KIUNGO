/** Public origin for the live demo. Override with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kiungo.jabali.studio"
).replace(/\/$/, "");
