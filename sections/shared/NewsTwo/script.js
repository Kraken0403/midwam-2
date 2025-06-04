// Compontents
import ButtonArrow from '@/components/ButtonArrow';
import GridNews from '@/components/GridNews';

export default {
    props: ['data', 'scrollType'],

    components: {
        ButtonArrow,
        GridNews,
    },

    mounted() {},

    methods: {
        show() {
            this.$refs.grid.show();
        },
    },
};
