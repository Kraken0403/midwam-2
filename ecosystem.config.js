module.exports = {
    apps: [
        {
            name: 'nuxt-server',
            exec_mode: 'cluster',
            instances: 'max',
            cwd: './',
            script: './node_modules/nuxt/bin/nuxt.js',
            args: 'start --port 3000 -c nuxt.config.production.js',
        },
    ],
};
