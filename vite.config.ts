import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { sentrySvelteKit } from '@sentry/sveltekit';

export default defineConfig(() => {
  return {
    plugins: [
      // Make sure `sentrySvelteKit` is registered before `sveltekit`
      sentrySvelteKit({
        sourceMapsUploadOptions: {
          org: 'anton-shubin',
          project: 'cdc',
          authToken: process.env.SENTRY_AUTH_TOKEN,
        },
      }),
      sveltekit(),
    ],
    test: {
      include: ['src/**/*.{test,spec}.{js,ts}'],
    },
  };
});
