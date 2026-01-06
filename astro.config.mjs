import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import node from '@astrojs/node'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  server: {
    allowedHosts: ['dev.noneweb.online'],
  },
  vite: {
    envPrefix: 'PUBLIC_',
    plugins: [tailwindcss()],
  },
  integrations: [react()],
})
