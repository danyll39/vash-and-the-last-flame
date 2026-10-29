import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
    // jsdom renders of the full map can take several seconds on a busy
    // laptop; the 5 s default timed out even though every assertion passed.
    testTimeout: 20000,
  },
})
