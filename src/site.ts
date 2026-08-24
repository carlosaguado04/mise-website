export const site = {
  name: "Mise",
  tagline: "Everything in its place, before you start.",
  title: "Mise — every window where it belongs",
  description:
    "Mise remembers how your windows were arranged and puts them back — apps launched, sized, and placed across every display. One click or a key, start working.",
  url: "https://usemise.dev",
  downloadUrl: "/Mise.dmg",
  xUrl: "https://x.com/AppMise",
  email: "hello@usemise.dev",
  minOs: "macOS 14+",
  proPrice: "$9.99",
  freeSetLimit: 2,
  raycastStoreUrl: "",
} as const;

export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.name,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "macOS 14.0 or later",
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
      description: "One-time unlock. Unlimited Sets, multi-display, hotkeys, terminal slots.",
    },
  ],
};
