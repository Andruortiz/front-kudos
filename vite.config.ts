import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // the tests must not depend on the developer's .env: no Entra login and no dev user
    env: { VITE_ENTRA_TENANT_ID: '', VITE_ENTRA_CLIENT_ID: '', VITE_DEV_USER_ID: '' },
  },
})
