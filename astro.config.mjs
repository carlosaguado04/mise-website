import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://mise.app",
  output: "static",
  trailingSlash: "never",
  compressHTML: true,
});
