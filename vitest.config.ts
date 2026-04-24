import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'json-summary'],
      include: ['lib/**/*.ts', 'app/api/**/*.ts'],
      exclude: [
        'lib/**/*.d.ts',
        'lib/supabase/admin.ts',
        'lib/analyzer/types.ts',
        'lib/scoring/config.ts',
      ],
      thresholds: {
        'lib/**': {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
        'app/api/**': {
          lines: 60,
          functions: 60,
          branches: 50,
          statements: 60,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
