// Store
import { LANGUAGE_SWITCH_STARTED } from '@/store';

export default {
    name: 'LanguageSwitcher',

    computed: {
        language() {
            if (this.$i18n.locale === 'en') {
                return {
                    locale: 'ar',
                    label: this.$t('global.languages.arabic'),
                };
            } else {
                return {
                    locale: 'en',
                    label: this.$t('global.languages.english'),
                };
            }
        },
    },

    methods: {
        clickHandler() {
            this.$store.commit('languageSwitch', LANGUAGE_SWITCH_STARTED);
            this.$emit('switch-language');
        },
    },
};
