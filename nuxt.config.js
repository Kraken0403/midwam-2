export default {
    loading: false,

    env: {
        BASE_URL_API: process.env.BASE_URL_API,
        BASE_URL_FRONTEND: process.env.BASE_URL_FRONTEND,
    },

    /*
     ** Nuxt rendering mode
     ** See https://nuxtjs.org/api/configuration-mode
     */
    mode: 'universal',
    /*
     ** Nuxt target
     ** See https://nuxtjs.org/api/configuration-target
     */
    // target: 'server', change to this when actually deploying
    target: 'static',
    /*
     ** Headers of the page
     ** See https://nuxtjs.org/api/configuration-head
     */
    head: {
        // htmlAttrs: {
        //     dir: 'rtl',
        // },
        title: process.env.npm_package_name || '',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            {
                hid: 'description',
                name: 'description',
                content: process.env.npm_package_description || '',
            },
        ],
        link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    },
    /*
     ** Global CSS
     */
    styleResources: {
        scss: [
            //
            '@/assets/styles/abstracts/_variables.scss',
            '@/assets/styles/abstracts/_functions.scss',
            '@/assets/styles/abstracts/_mixins.scss',
        ],
    },
    css: [
        '@/assets/styles/base/_reset.scss',
        '@/assets/styles/base/_fonts.scss',
        '@/assets/styles/base/_button.scss',
        '@/assets/styles/base/_typography.scss',
        '@/assets/styles/base/_breakpoints.scss',
    ],
    /*
     ** Plugins to load before mounting the App
     ** https://nuxtjs.org/guide/plugins
     */
     plugins: ['@/plugins/copyright.server.js'],
    /*
     ** Auto import components
     ** See https://nuxtjs.org/api/configuration-components
     */
    components: [
        {
            path: '@/components/',
            extensions: ['vue'],
        },
        {
            path: '@/sections/',
            extensions: ['vue'],
        },
    ],
    /*
     ** Nuxt.js dev-modules
     */
    buildModules: [
        // Doc: https://github.com/nuxt-community/eslint-module
        // '@nuxtjs/eslint-module',
        // Doc: https://github.com/nuxt-community/stylelint-module
        '@nuxtjs/stylelint-module',
        '@nuxt/components',
        '@nuxtjs/google-analytics',
    ],
    /*
     ** Nuxt.js modules
     */
    modules: [
        // Doc: https://axios.nuxtjs.org/usage
        '@nuxtjs/axios',
        // Doc: https://github.com/nuxt-community/dotenv-module
        '@nuxtjs/dotenv',
        '@nuxtjs/style-resources',
        '@nuxtjs/svg',
        'nuxt-i18n',
    ],
    /*
     ** Google Analytics
     */
    googleAnalytics: {
        id: process.env.GOOGLE_ANALYTICS_ID,
        debug: {
            enabled: false,
            trace: false,
            sendHitTask: process.env.NODE_ENV !== 'development',
        },
    },
    /*
     ** i18n
     */
    i18n: {
        locales: ['en', 'ar'],
        defaultLocale: 'en',
        strategy: 'prefix',
        vueI18n: {
            fallbackLocale: 'en',
            messages: {
                en: require('./locales/en.json'),
                ar: require('./locales/ar.json'),
            },
        },
    },
    /*
     ** Axios module configuration
     ** See https://axios.nuxtjs.org/options
     */
    axios: {},
    /*
     ** Build configuration
     ** See https://nuxtjs.org/api/configuration-build/
     */
    build: {
        extend(config, ctx) {
            /**
             * GLSL loader
             */
            config.module.rules.push({
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: ['raw-loader', 'glslify-loader'],
            });
        },

        babel: {
            compact: false,  // Prevents large file warnings
        },

        transpile: ['three'],
    },

    server: {
        port: 8000,
        host: '0.0.0.0',
    },
};
