// Vendor
import gsap from 'gsap';

// Plugins
import axios from '@/plugins/axios';

// Components
import Page from '@/components/Page';
import SmoothScroll from '@/components/SmoothScroll';
import StickyShare from '@/components/StickyShare';

// Sections
import SectionHeader from '@/sections/news-detail/Header';
import SectionColumn from '@/sections/news-detail/Column';
import SectionVideo from '@/sections/shared/Video';
import SectionImage from '@/sections/shared/Image';
import SectionGallery from '@/sections/shared/Gallery';
import SectionShare from '@/sections/news-detail/Share';
import SectionNews from '@/sections/shared/News';
import SectionFooter from '@/sections/shared/Footer';

export default {
    extends: Page,

    components: {
        SectionHeader,
        SectionColumn,
        SectionVideo,
        SectionImage,
        SectionGallery,
        SectionShare,
        SectionNews,
        SectionFooter,
        SmoothScroll,
        StickyShare,
    },

    asyncData({ params, app }) {
        const slug = params.slug;
        const locale = app.i18n.locale;
        return axios.get(`page/news?slug=${slug}&lang=${locale}`).then((res) => {
            return {
                data: res.data,
                metadata: res.data.seo,
                header: res.data.header,
                sectionsData: res.data.sections,
                related: res.data.related,
            };
        });
    },

    computed: {
        sections() {
            const sections = [];
            let item;
            for (let i = 0, len = this.sectionsData.length; i < len; i++) {
                item = this.sectionsData[i];
                sections.push({
                    component: this.getComponent(item.layout_type),
                    data: item,
                });
            }
            return sections;
        },
    },

    created() {
        this.scrollTriggers = true;
    },

    methods: {
        /**
         * Public
         */
        transitionIn() {
            const timeline = new gsap.timeline();
            timeline.add(this.$refs.header.transitionIn(), 0);
            timeline.add(this.$refs.stickyShare.show(), 1);
            timeline.add(this.$root.theNavigation.show(), 1);
            if (this.$root.webglApp) timeline.add(this.$root.webglApp.showScene('empty'), 0);
        },

        transitionOut(done) {
            const timeline = new gsap.timeline({ onComplete: done });
            timeline.to(this.$el, 0.8, { alpha: 0, ease: 'sine.inOut' }, 0);
        },

        /**
         * Private
         */
        getComponent(name) {
            switch (name) {
                case '1_column':
                    return SectionColumn;
                case 'image':
                    return SectionImage;
                case 'video':
                    return SectionVideo;
                case 'gallery':
                    return SectionGallery;
            }
        },
    },
};
