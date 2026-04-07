export const designVariants = [
  {
    id: "mission-first",
    label: "Mission-first",
    shortDescription: "Compassionate, trust-centered, and survivor-sensitive.",
  },
  {
    id: "youthful",
    label: "Youthful",
    shortDescription: "Hopeful, energetic, and more visibly uplifting.",
  },
  {
    id: "institutional",
    label: "Institutional",
    shortDescription: "Formal, accountable, and confidence-building.",
  },
  {
    id: "sanctuary",
    label: "Sanctuary",
    shortDescription: "Warm editorial storytelling with terracotta and sage accents.",
  },
  {
    id: "beacon",
    label: "Beacon",
    shortDescription: "Bold geometric contrast with indigo structure and coral energy.",
  },
  {
    id: "bloom",
    label: "Bloom",
    shortDescription: "Soft organic calm with plum, sage, and blush tones.",
  },
  {
    id: "chronicle",
    label: "Chronicle",
    shortDescription: "Dark magazine treatment with premium contrast and gold accents.",
  },
  {
    id: "radiant",
    label: "Radiant",
    shortDescription: "Vibrant hopeful direction led by teal and sunshine highlights.",
  },
  {
    id: "refuge",
    label: "Refuge",
    shortDescription: "Minimal refined layout with restrained warmth and elegant spacing.",
  },
] as const

export const designReviewPages = [
  {
    id: "home",
    label: "Landing Page",
    routePrefix: "/design-review/home",
    productionRoute: "/",
    summary: "Public first impression with mission, trust cues, and impact.",
  },
  {
    id: "donate",
    label: "Donation Page",
    routePrefix: "/design-review/donate",
    productionRoute: "/donate",
    summary: "Anonymous donation flow focused on clarity and conversion.",
  },
  {
    id: "login",
    label: "Login Page",
    routePrefix: "/design-review/login",
    productionRoute: "/login",
    summary: "Authentication entry experience focused on trust and guidance.",
  },
] as const

export type DesignVariantId = (typeof designVariants)[number]["id"]
export type DesignReviewPageId = (typeof designReviewPages)[number]["id"]

export function isDesignVariantId(value: string | undefined): value is DesignVariantId {
  return designVariants.some((variant) => variant.id === value)
}

export function getDesignVariantMeta(variant: DesignVariantId) {
  return designVariants.find((entry) => entry.id === variant) ?? designVariants[0]
}
