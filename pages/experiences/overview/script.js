// Vendor
import gsap from 'gsap';
// Plugins
import axios from '@/plugins/axios';

// Components
import Page from '@/components/Page';

// Sections
import SectionProjectList from '@/sections/portfolio-overview/ProjectList';
import SectionProjectSlider from '@/sections/portfolio-overview/ProjectSlider';
import { log } from 'three';

export default {
    extends: Page,

    components: {
        SectionProjectList,
        SectionProjectSlider,
    },

    asyncData({ app, store, query }) {
        const locale = app.i18n.locale;
        return axios.get(`page/portfolio?lang=${locale}`).then((res) => {
            const activeQuery = query.category;
            const categories = res.data.categories;
            let activeCategory = null;

            for (let i = 0; i < categories.length; i++) {
                const category = categories[i];
                if (activeQuery === category.title.toLowerCase()) {
                    activeCategory = category.id;
                }
            }

            const items = res.data.items;

            const filteredItems = items.filter((project) => {
                if (!project.categories) return false;

                for (let i = 0; i < project.categories.length; i++) {
                    const category = project.categories[i];
                    return category === activeCategory;
                }
            });

            return {
                metadata: res.data.seo,
                activeProjects: filteredItems.length > 0 ? filteredItems : items,
                items,
                categories,
                activeCategory,
            };
        });
    },

    data() {
        return {
            isReady: false,
            projectListState: '',
            projectSliderState: 'is-active',
            displayMode: 'slider',
            allowCategoryChange: true,
            // Data
            activeProjects: [],
            lang: this.$i18n.locale,
        };
    },

    created() {
        this.scrollTriggers = true;
    },

    mounted() {
        // Flags
        this.allowToggleDisplay = true;

        // Analytics
        this.hasUsedListDisplay = false;

        this.setActiveCheckbox();
    },

    methods: {
        transitionIn() {
            const timeline = new gsap.timeline();
            if (this.$root.webglApp) timeline.add(this.$root.webglApp.showScene('portfolio'), 0);
            timeline.to(this.$el, 1.3, { alpha: 1, ease: 'sine.inOut' }, 0.5);
            timeline.add(this.$root.theNavigation.show(), 1);
            // timeline.add(this.$root.buttonMute.show(), 1.1);
            this.isReady = true;           
        },

        transitionOut(done) {
            const timeline = new gsap.timeline({ onComplete: done });
            if (this.$root.webglApp) timeline.add(this.$root.webglApp.hideScene('portfolio'), 0);
            timeline.to(this.$el, 1, { alpha: 0, ease: 'sine.inOut' }, 0);
        },

        buttonSliderIn() {
            const promise = new Promise((resolve) => {
                this.buttonSliderInTimeline = new gsap.timeline({ onComplete: resolve });
                this.buttonSliderInTimeline.fromTo(this.$refs.buttonSlider, 0.9, { alpha: 0, y: 10 }, { alpha: 1, y: 0, ease: 'power3.out' });
            });

            return promise;
        },

        buttonSliderOut() {
            const promise = new Promise((resolve) => {
                this.buttonSliderOutTimeline = new gsap.timeline({ onComplete: resolve });
                this.buttonSliderOutTimeline.to(this.$refs.buttonSlider, 0.9, { alpha: 0, y: -10, ease: 'power3.in' });
            });

            return promise;
        },

        buttonListIn() {
            const promise = new Promise((resolve) => {
                this.buttonListInTimeline = new gsap.timeline({ onComplete: resolve });
                this.buttonListInTimeline.fromTo(this.$refs.buttonList, 0.9, { alpha: 0, y: 10 }, { alpha: 1, y: 0, ease: 'power3.out' });
            });

            return promise;
        },

        buttonListOut() {
            const promise = new Promise((resolve) => {
                this.buttonListOutTimeline = new gsap.timeline({ onComplete: resolve });
                this.buttonListOutTimeline.to(this.$refs.buttonList, 0.9, { alpha: 0, y: -10, ease: 'power3.in' });
            });

            return promise;
        },

        filterItems(activeCategory) {
            const filteredItems = this.items.filter((project) => {
                if (!project.categories) return false;

                for (let i = 0; i < project.categories.length; i++) {
                    const category = project.categories[i];
                    return category === activeCategory;
                }
            });

            this.activeProjects = filteredItems.length > 0 ? filteredItems : this.items;
        },

        setActiveCheckbox() {
            // for (let i = 0; i < this.$refs.checkbox.length; i++) {
            //     const checkbox = this.$refs.checkbox[i];
            //     if (parseInt(checkbox.value) === this.activeCategory) {
            //         checkbox.checked = true;
            //     }
            // }
        },

        setRouteQuery(activeCategory) {
            if (isNaN(activeCategory)) {
                this.$router.push({ path: 'experiences' });
                return;
            }

            for (let i = 0; i < this.categories.length; i++) {
                const category = this.categories[i];
                if (activeCategory === category.id) {
                    this.$router.push({ path: 'experiences', query: { category: category.title.toLowerCase() } });
                }
            }
        },

        categoryClickHandler(e) {
            const element = e.currentTarget;

            const index = parseInt(element.value);
            const activeCategory = index;

            this.allowCategoryChange = false;

            const component = this.displayMode === 'slider' ? this.$refs.slider : this.$refs.list;

            component.hideItems().then(() => {
                if (activeCategory === null) {
                    this.activeProjects = this.items;
                } else {
                    this.filterItems(activeCategory);
                    this.setRouteQuery(activeCategory);
                    this.activeCategory = activeCategory;
                    component.updateItems();
                }

                component.showItems().then(() => {
                    this.allowCategoryChange = true;
                });
            });

            // Analytics
            this.$ga.event({
                eventCategory: 'click',
                eventAction: 'filter works',
                eventLabel: `index : ${index}`,
            });
        },

        toggleDisplayClickHandler() {
            if (!this.allowToggleDisplay) return;

            this.allowToggleDisplay = false;

            if (this.displayMode === 'slider') {
                // Transitions lists
                this.$refs.slider.hide();
                this.$refs.list.show().then(() => {
                    this.allowToggleDisplay = true;
                });

                this.projectListState = 'is-active';

                // Buttons transition
                this.buttonListOut().then(() => {
                    this.displayMode = 'list';
                    this.buttonSliderIn();
                });

                // Analytics
                if (this.hasUsedListDisplay) return;
                this.hasUsedListDisplay = true;
                this.$ga.event({
                    eventCategory: 'click',
                    eventAction: 'Choose display portfolio list',
                });
            } else {
                // Transitions lists
                this.$refs.slider.show();
                this.$refs.list.hide().then(() => {
                    this.allowToggleDisplay = true;
                });

                this.projectSliderState = 'is-active';

                // Buttons transition
                this.buttonSliderOut().then(() => {
                    this.displayMode = 'slider';
                    this.buttonListIn();
                });
            }
        },
    },
};
