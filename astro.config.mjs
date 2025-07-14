import { defineConfig } from 'astro/config';
import tailwindcss from 'tailwindcss';

export default defineConfig({
  integrations: [],

  vite: {
    plugins: [tailwindcss()],               // <-- COMMA here
    optimizeDeps: { include: ['alpinejs'] } // <-- closing brace OK
  }
});
