import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        'vitest.config.ts',
        '**/*.test.ts',
        '**/*.spec.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      // Handle .js imports in TypeScript files
      './server.js': './server.ts',
      './tool.js': './tool.ts',
      './resource.js': './resource.ts',
      './prompt.js': './prompt.ts',
      './sampling.js': './sampling.ts',
      './types.js': './types.ts'
    }
  }
});