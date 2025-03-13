// Vendor
import gsap from 'gsap';

// Utils
import AudioManager from '@/utils/AudioManager';

// Plugins
import axios from '@/plugins/axios';

// Components
import Page from '@/components/Page';
import SmoothScroll from '@/components/SmoothScroll';

// Sections
import SectionHeader from '@/sections/portfolio-detail/Header';
import SectionVideo from '@/sections/shared/Video';
import SectionParagraphTitles from '@/sections/portfolio-detail/ParagraphTitles';
import SectionImage from '@/sections/shared/Image';
import SectionStats from '@/sections/portfolio-detail/Stats';
import SectionTitlesParagraph from '@/sections/portfolio-detail/TitlesParagraph';
import SectionGallery from '@/sections/shared/Gallery';
import SectionMoreProjects from '@/sections/portfolio-detail/MoreProjects';
import SectionFooter from '@/sections/shared/Footer';

export default {
    extends: Page,

    components: {
        SectionHeader,
        SectionVideo,
        SectionStats,
        SectionParagraphTitles,
        SectionImage,
        SectionTitlesParagraph,
        SectionGallery,
        SectionMoreProjects,
        SectionFooter,
        SmoothScroll,
    },

    asyncData({ params, app }) {
        const slug = params.slug;
        const locale = app.i18n.locale;

        return axios.get(`page/portfolio?slug=${slug}&lang=${locale}`).then((res) => {
            return {
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
        transitionIn(done, routInfo) {
            const delay = routInfo.previous === null ? 1 : 0;
            const timeline = new gsap.timeline({ onComplete: done, delay });
            timeline.add(this.$refs.header.transitionIn(), 0);
            timeline.add(this.$root.theNavigation.show(), 1);
            timeline.add(this.$root.buttonMute.show(), 1.1);
            if (this.$root.webglApp) timeline.add(this.$root.webglApp.showScene('empty'), 0);

            AudioManager.play('background-loop-1', {
                loop: true,
            });
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
                case '2_columns_titles_paragraph':
                    return SectionTitlesParagraph;
                case '2_columns_paragraph_titles':
                    return SectionParagraphTitles;
                case 'image':
                    return SectionImage;
                case 'video':
                    return SectionVideo;
                case 'stats':
                    return SectionStats;
                case 'gallery':
                    return SectionGallery;
            }
        },
    },
};
