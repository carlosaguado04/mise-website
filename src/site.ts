export const site = {
  name: "Mise",
  tagline: "Every window where it belongs. In one click.",
  title: "Mise — every window where it belongs",
  description:
    "Capture the desk once. Put every app back — launched, sized, on the right display — in one click.",
  url: "https://usemise.dev",
  /** No live DMG in the repo — never invent a store link. */
  dmgUrl: null as string | null,
  xUrl: "https://x.com/AppMise",
  email: "hello@usemise.dev",
  platform: "Apple Silicon",
  proPrice: "$9.99",
  freeSetLimit: 2,
  raycastStoreUrl: "https://www.raycast.com/carlosaguado04/mise-window-sets",
  raycastBadgeUrl:
    "https://www.raycast.com/carlosaguado04/mise-window-sets/install_button@2x.png?v=1.1",
  acidityUrl: "https://www.acidity.lol",
} as const;

export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.name,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "macOS 14.0 or later, Apple Silicon",
  description: site.description,
  url: site.url,
  image: `${site.url}/og.png`,
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: `Forever. ${site.freeSetLimit} Sets.`,
    },
    {
      "@type": "Offer",
      name: "Mise Pro",
      price: "9.99",
      priceCurrency: "USD",
      description:
        "One-time unlock. Unlimited Sets, multi-display, global hotkeys, terminal/tmux slots, Raycast apply.",
    },
  ],
};
