// Ensure Nitro defaults to the Vercel preset for Vercel deployment
if (!process.env.NITRO_PRESET) {
  process.env.NITRO_PRESET = "vercel";
}

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({});
