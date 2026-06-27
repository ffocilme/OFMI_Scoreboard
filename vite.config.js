import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Serve from `/` locally and from the GitHub Pages repository path in builds.
  base: command === 'serve' ? '/' : '/OFMIScoreboard/',
}));
