// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  ssr: false,
  modules: ['@pinia/nuxt'],
  css: ['~/assets/scss/main.scss'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/_tokens.scss" as *;',
        },
      },
    },
  },
  nitro: {
    devProxy: {
      // Dev only. Production routes /api through vercel.json.
      '/api': {
        target: 'http://localhost:3001',
      },
    },
  },
  app: {
    head: {
      title: 'Susi Air Pilot App',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400..800&display=swap',
        },
      ],
    },
  },
})
