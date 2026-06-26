import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [react()],
  base: '/OFMI_Scoreboard/',
  server: {
    proxy: {
      // Proxies the full scoreboard HTML page — the same URL that worked before,
      // just without going through allorigins. No CORS, no rate-limits.
      '/omegaup-proxy': {
        target: 'https://omegaup.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/omegaup-proxy/, ''),
      },
    },
  },
})
 
