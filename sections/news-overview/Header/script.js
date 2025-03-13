// Components
import Section from '@/components/Section';
import Heading from '@/components/Heading';

export default {
    extends: Section,

    props: ['data'],

    data() {
        return {
            lang: this.$i18n.locale,
            isInView: false,
        };
    },

    components: {
        Heading,
    },

    created() {},

    methods: {
        /**
         * Public
         */
        transitionIn() {
            this.$refs.heading.show();
        },
    },
};
