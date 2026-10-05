import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './vite.config'
import { configDefaults } from 'vitest/config'

export default mergeConfig(baseConfig, {
  test: {
    ...configDefaults,
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})