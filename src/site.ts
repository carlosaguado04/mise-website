export const site = {
  name: "Mise",
  tagline: "Everything in its place, before you start.",
  title: "Mise — every window where it belongs",
  description:
    "Mise remembers how your windows were arranged and puts them back — apps launched, sized, and placed across every display. Press a key, start working.",
  url: "https://mise.app",
  downloadUrl: "/Mise.dmg",
  xUrl: "https://x.com/AppMise",
  email: "hello@usemise.dev",
  minOs: "macOS 14+",
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
};
