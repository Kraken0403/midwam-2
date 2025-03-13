// Assets
import Arrow from '@/assets/images/icons/arrow-right.svg?inline';

export default {
    props: ['link'],

    computed: {
        to: function () {
            return `/${this.$i18n.locale}/${this.link}`;
        },
    },

    components: {
        Arrow,
    },
};
