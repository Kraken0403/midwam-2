// Vendor
import gsap from 'gsap';

// Plugins
import axios from '@/plugins/axios';

// Utils
import ResourceLoader from '@/utils/ResourceLoader.js';

// Components
import CirclesLoader from '@/components/CirclesLoader';
import CookiesMessage from '@/components/CookiesMessage';
// import ButtonStart from '@/components/ButtonStart'; // Removed button requirement

// Store
import { PRELOADER_STARTED, PRELOADER_ASSETS_LOADED, PRELOADER_COMPLETED } from '@/store';

// Resources
import resources from '@/resources.js';
// import AudioManager from '@/utils/AudioManager'; // Commented out audio for now

export default {
    components: {
        CirclesLoader,
        CookiesMessage,
        // ButtonStart, // No longer needed
    },

    fetch() {
        const locale = this.$i18n.locale;
        return axios.get(`page/portfolio?lang=${locale}`).then((res) => {
            this.$store.commit('portfolio/items', res.data.items);
            this.$store.commit('portfolio/categories', res.data.categories);
            this.portfolioItems = res.data.items;
            return {
                items: res.data.items,
            };
        });
    },

    data() {
        return {
            portfolioItems: [],
        };
    },

    created() {
        this.isTimelineShowComplete = false;
        this.isQueueComplete = false;
    },

    mounted() {
        this.lockScroll();
        this.$store.commit('preloader', PRELOADER_STARTED);
        this.addPortfolioImages();
        this.loadResources();
        this.setupEventListeners();
        this.show();
    },

    beforeDestroy() {
        this.removeEventListeners();
    },

    methods: {
        /**
         * Private
         */
        setupEventListeners() {
            this.$root.resourceLoader.addEventListener('complete', this.loadResourcesCompleteHandler);
        },

        removeEventListeners() {
            this.$root.resourceLoader.removeEventListener('complete', this.loadResourcesCompleteHandler);
        },

        addPortfolioImages() {
            for (let i = 0; i < this.portfolioItems.length; i++) {
                const image = this.portfolioItems[i].image.sizes['1920x0'];
                const resource = {
                    type: 'image',
                    name: this.portfolioItems[i].slug,
                    absolutePath: image.url,
                };

                resources.push(resource);
            }
        },

        loadResources() {
            const basePath = this.$router.options.base === '/' ? '' : this.$router.options.base;
            this.$root.resourceLoader = new ResourceLoader(resources, basePath);
        },

        show() {
            const timeline = gsap.timeline({ delay: 1 });
            timeline.add(this.$refs.circles.play(), 0);
            timeline.call(this.timelineShowCompleteHandler, null, 1.6);
        },

        hide() {
            const timeline = gsap.timeline({ onComplete: this.hideCompleteHandler });
            // timeline.add(this.$refs.buttonStart.transitionOut(), 0); // Removed button animation
            timeline.add(this.$refs.cookiesMessage.hide(), 0);
            timeline.to(this.$el, 1, { autoAlpha: 0, ease: 'sine.inOut' }, 1);
        },

        showIntro() {
            const timeline = gsap.timeline();
            // timeline.add(this.$refs.buttonStart.transitionIn(), 0); // Removed button animation
            timeline.add(this.$refs.cookiesMessage.show(), 0.1);
            this.unlockScroll(); // Unlock scrolling after preloader finishes
        },

        /*
        playBackgroundMusic() {
            AudioManager.play('background-loop-1', { loop: true });
        },
        */

        lockScroll() {
            if (!this.$root.scrollManager) return;
            this.$root.scrollManager.lockScroll();
        },

        unlockScroll() {
            if (!this.$root.scrollManager) return;
            this.$root.scrollManager.unlockScroll();
        },

        /**
         * Handlers
         */
        loadResourcesCompleteHandler() {
            this.isQueueComplete = true;
            if (this.isTimelineShowComplete) {
                this.showIntro();
            }
        },

        timelineShowCompleteHandler() {
            if (this.isQueueComplete) {
                this.$store.commit('preloader', PRELOADER_ASSETS_LOADED);
                this.isTimelineShowComplete = true;
                this.showIntro();
                this.hide(); // Hide preloader after assets are loaded
            } else {
                this.isTimelineShowComplete = false;
                this.show();
            }
        },

        timelineHideCompleteHandler() {
            // this.playBackgroundMusic(); // Removed background music
            this.unlockScroll();
            this.$store.commit('preloader', PRELOADER_COMPLETED);
        },

        /*
        buttonStartClickHandler() {
            this.hide();
            // Analytics
            this.$ga.event({
                eventCategory: 'click',
                eventAction: 'click start button',
            });
        },

        buttonCookiesClickHandler() {
            this.hide();
            // Analytics
            this.$ga.event({
                eventCategory: 'click',
                eventAction: 'click start button',
            });
        },
        */

        hideCompleteHandler() {
            this.$el.style.display = 'none';
            this.$store.commit('preloader', PRELOADER_COMPLETED);
        },
    },
};
