module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
    },
    parserOptions: {
        parser: 'babel-eslint',
    },
    extends: ['@nuxtjs', 'prettier', 'prettier/vue', 'plugin:prettier/recommended', 'plugin:nuxt/recommended'],
    plugins: ['prettier'],
    rules: {
        'no-unused-vars': 0,
        'import/order': 0,
        'new-cap': 0,
        'unicorn/number-literal-case': 0,
        'no-console': 0,
    },
};
