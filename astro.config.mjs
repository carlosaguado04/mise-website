import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://usemise.dev",
  output: "static",
  trailingSlash: "never",
  compressHTML: true,
});
