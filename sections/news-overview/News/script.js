// Vendor
import gsap from 'gsap';

// Plugins
import axios from '@/plugins/axios';

// Components
import Section from '@/components/Section';
import GridNews from '@/components/GridNews';

export default {
    extends: Section,

    components: {
        GridNews,
    },

    props: ['categories', 'items', 'category', 'pagination'],

    data() {
        return {
            lang: this.$i18n.locale,
            isReady: false,
            activeItems: this.items,
            activeCategory: this.category,
            activePage: 1,
            activePagination: this.pagination,
        };
    },

    mounted() {
        this.setupIntersectionObserver();
        this.checkIfMoreItems();
        this.checkActiveFilter();
    },

    methods: {
        /**
         * Public
         */
        show() {
            this.isReady = true;
            this.$refs.grid.show();
            const timeline = new gsap.timeline();
            if (this.$refs.inputContainer1) timeline.to(this.$refs.inputContainer1, 1, { alpha: 1, ease: 'power1.in' }, 0);
            if (this.$refs.inputContainer) timeline.to(this.$refs.inputContainer, 1, { alpha: 1, stagger: -0.1, ease: 'power1.in' }, 0.1);

            return timeline;
        },

        hide() {},

        /**
         * Private
         */
        transitionOut() {
            return new Promise((resolve) => {
                const timeline = new gsap.timeline({ onComplete: resolve });
                timeline.to(this.$refs.grid.$el, 1, { alpha: 0, ease: 'power1.inOut' });
            });
        },

        transitionIn() {
            return new Promise((resolve) => {
                const timeline = new gsap.timeline({ onComplete: resolve });
                timeline.to(this.$refs.grid.$el, 1, { alpha: 1, ease: 'power1.inOut' });
            });
        },

        checkActiveFilter() {
            if (!this.$refs.checkbox) return;

            for (let i = 0; i < this.$refs.checkbox.length; i++) {
                const checkbox = this.$refs.checkbox[i];
                if (checkbox.dataset.slug === this.activeCategory) {
                    checkbox.checked = true;
                }
            }
        },

        setRouteQuery(category) {
            this.$router.push({ path: 'news', query: { category: category || '' } });
        },

        setupIntersectionObserver() {
            const options = { threshold: 0.2 };

            this.intersectionObserver = new IntersectionObserver(this.observerHandler, options);
            this.intersectionObserver.observe(this.$refs.button);
        },

        getItems() {
            const categoryUrl = this.activeCategory ? `&category=${this.activeCategory}` : '';
            const pageUrl = `&page=${this.activePage}`;
            const langUrl = `&lang=${this.lang}`;

            return axios.get(`page/news?per_page=5${pageUrl}${categoryUrl}${langUrl}`).then((res) => {
                this.activePagination = res.data.pagination;
                const newItems = res.data.items;
                return newItems;
            });
        },

        checkIfMoreItems() {
            if (this.activeItems.length < this.activePagination.total) {
                this.enableLoadMore();
            } else {
                this.disableLoadMore();
            }
        },

        enableLoadMore() {
            this.$refs.button.style.visibility = 'visible';
        },

        disableLoadMore() {
            this.$refs.button.style.visibility = 'hidden';
        },

        updateScroll() {
            if (!this.$root.scrollManager.smoothScroll) return;
            this.$root.scrollManager.smoothScroll.update();
        },

        /**
         * Handlers
         */
        categoryClickHandler(e) {
            this.activePage = 1;

            const element = e.target;
            const index = parseInt(element.value);
            let activeCategory = null;

            for (let i = 0; i < this.categories.length; i++) {
                const category = this.categories[i];
                if (category.id === index) {
                    activeCategory = category.slug;
                }
            }

            this.activeCategory = activeCategory;
            this.setRouteQuery(this.activeCategory);
            this.$store.commit('news/setActiveCategory', this.activeCategory);

            this.transitionOut().then(() => {
                this.getItems().then((newItems) => {
                    this.activeItems = newItems;
                    this.checkIfMoreItems();
                    this.transitionIn();
                    this.$nextTick(() => {
                        this.updateScroll();
                    });
                });
            });
        },

        loadMoreClickHanlder() {
            this.activePage++;
            this.getItems().then((newItems) => {
                for (let i = 0; i < newItems.length; i++) {
                    this.activeItems.push(newItems[i]);
                }
                this.checkIfMoreItems();
                this.$nextTick(() => {
                    this.updateScroll();
                });
            });
        },

        observerHandler(entry, observer) {
            if (!this.isReady) return;

            if (entry[0].isIntersecting) {
                gsap.to(this.$refs.button, 1, { alpha: 1, ease: 'power1.in' });
                observer.disconnect();
            }
        },
    },
};
