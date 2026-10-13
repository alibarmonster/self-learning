import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig} */
export default {
  // Strips the TypeScript in <script lang="ts"> blocks before Svelte compiles them.
  preprocess: vitePreprocess()
};
