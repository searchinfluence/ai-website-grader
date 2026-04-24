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
        // High-value scoring + glue modules: tight thresholds.
        'lib/analyzer/**': { lines: 95, functions: 100, branches: 85, statements: 95 },
        'lib/supabase/**': { lines: 95, functions: 100, branches: 85, statements: 95 },
        'lib/utils.ts': { lines: 95, functions: 100, branches: 95, statements: 95 },
        'lib/analysis-engine.ts': { lines: 95, functions: 100, branches: 80, statements: 95 },
        'lib/normalize-analysis.ts': { lines: 95, functions: 90, branches: 85, statements: 95 },
        'lib/scoring/**': { lines: 100, functions: 100, branches: 100, statements: 100 },
        'lib/exporters.ts': { lines: 95, functions: 100, branches: 70, statements: 95 },
        'lib/hubspot.ts': { lines: 90, functions: 50, branches: 85, statements: 90 },
        // Larger inherited modules with deep network/HTML branching.
        'lib/performance-apis.ts': { lines: 85, functions: 90, branches: 70, statements: 85 },
        'lib/crawler.ts': { lines: 80, functions: 80, branches: 65, statements: 80 },
        // API routes — moderately covered.
        'app/api/**': { lines: 90, functions: 80, branches: 80, statements: 90 },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
