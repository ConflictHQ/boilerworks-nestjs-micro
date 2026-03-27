import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: '.',
    include: ['src/**/*.spec.ts', 'test/**/*.{spec,e2e-spec}.ts'],
    globals: true,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
