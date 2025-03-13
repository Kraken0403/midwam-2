// Components
import SectionError from '@/sections/error/error';
import Page from '@/components/Page';

export default {
    extends: Page,

    props: ['error'],

    data() {
        return {
            environment: this.$root.environment,
        };
    },

    components: {
        SectionError,
    },

    head() {
        return {
            title: 'Page not found',
        };
    },

    created() {
        this.$store.commit('errorPageActive', true);
    },

    mounted() {
        setTimeout(() => {
            this.$root.theNavigation.show();
            this.$refs.sectionError.show();
        }, 8500);
    },
};
