// Utils
import WindowResizeObserver from '@/utils/WindowResizeObserver';
import helpers from '@/utils/helpers';
import Breakpoints from '@/utils/Breakpoints';
import device from '@/utils/device';

// Store
import { PRELOADER_COMPLETED, LANGUAGE_SWITCH_FINISHED } from '@/store';

// Constants
const TYPE_PAGE = 'page';

function getPage(view) {
    if (view.$options.type === TYPE_PAGE) {
        return view;
    }

    const children = view.$children;
    let result;
    for (let i = 0, len = children.length; i < len; i++) {
        if (children[i].$options.type === TYPE_PAGE) {
            result = children[i];
            break;
        } else if (typeof children[i].$children === 'object') {
            return getPage(children[i].$children);
        }
    }
    return result;
}

let currentLocale = null;
function updateBodyLocaleClass(locale, store) {
    if (currentLocale !== locale) {
        document.body.classList.remove(currentLocale);
        document.body.classList.add(locale);
        currentLocale = locale;
        store.commit('languageSwitch', LANGUAGE_SWITCH_FINISHED);
    }
}

let page = null;
let routeInfo = null;

export default {
    type: TYPE_PAGE,

    head() {
        if (this.metadata) {
            return {
                title: this.metadata.title,
                meta: [
                    { hid: 'description', name: 'description', content: this.metadata.description },
                    { hid: 'og:title', name: 'og:title', content: this.metadata.title },
                    { hid: 'og:type', name: 'og:type', content: 'website' },
                    { hid: 'og:description', name: 'og:description', content: this.metadata.description },
                    { hid: 'og:url', name: 'og:url', content: process.env.BASE_URL_FRONTEND + this.$route.path },
                    { hid: 'og:image', name: 'og:image', content: process.env.BASE_URL_FRONTEND + '/assets/images/share.jpg' },
                ],
            };
        }
    },

    created() {
        this.__observers = [];
        this.__activeSectionIndex = 0;
        this.__activeSection = null;
        this.__currentLocale = null;
        this.__touchStartPosition = { x: 0, y: 0 };
        this.__setupEventListeners();
    },

    mounted() {
        this.__sections = this.$el.querySelectorAll('section');

        this.__resize();
        if (this.scrollTriggers) this.__setupSectionObservers();
        this.__setupScrollEventListener();
    },

    beforeDestroy() {
        if (this.scrollTriggers) this.__disconnectSectionObservers();
        this.__removeEventListeners();
    },

    transition: {
        appear: true,
        mode: 'out-in',
        css: false,

        beforeEnter(el) {
            const page = getPage(el.__vue__);
            if (page && typeof page.transitionInit === 'function') {
                page.transitionInit();
            }
            this.$root.$emit('transition-init');
        },

        enter(el, done) {
            page = getPage(el.__vue__);
            routeInfo = {
                previous: this.$store.state.router.previous,
                current: this.$store.state.router.current,
            };

            updateBodyLocaleClass(this.$i18n.locale, this.$store);

            if (this.$store.state.preloader !== PRELOADER_COMPLETED) return;

            if (this.$store.state.errorPageActive) {
                this.$children[0].transitionIn(done, routeInfo);
                this.$store.commit('errorPageActive', false);
            } else if (page && typeof page.transitionIn === 'function') {
                page.transitionIn(done, routeInfo);
            } else {
                done();
            }
            this.$root.$emit('transition-in');
        },

        leave(el, done) {
            const page = getPage(this);
            const routeInfo = {
                previous: this.$store.state.router.previous,
                current: this.$store.state.router.current,
            };

            if (page && typeof page.transitionOut === 'function') {
                page.transitionOut(done, routeInfo);
            } else {
                done();
            }
            this.$root.$emit('transition-out');
        },
    },

    methods: {
        /**
         * Private
         */
        __setupEventListeners() {
            this.$store.watch((state) => state.preloader, this.__preloaderChangeHandler);
            WindowResizeObserver.addEventListener('resize', this.__resizeHandler);

            // if (process.client) {
            //     window.addEventListener('mousedown', this.__mouseDownHandler);
            //     window.addEventListener('mouseup', this.__mouseUpHandler);
            //     window.addEventListener('touchstart', this.__touchStartHandler);
            //     window.addEventListener('touchmove', this.__touchMoveHandler);
            //     window.addEventListener('touchend', this.__touchEndHandler);
            // }
        },

        __removeEventListeners() {
            WindowResizeObserver.removeEventListener('resize', this.__resizeHandler);

            // if (process.client) {
            //     window.removeEventListener('mousedown', this.__mouseDownHandler);
            //     window.removeEventListener('mouseup', this.__mouseUpHandler);
            //     window.removeEventListener('touchstart', this.__touchStartHandler);
            //     window.removeEventListener('touchmove', this.__touchMoveHandler);
            //     window.removeEventListener('touchend', this.__touchEndHandler);
            // }
        },

        __setupScrollEventListener() {
            if (!device.isTouch() && this.$root.scrollManager) {
                this.$nextTick(() => {
                    this.$root.scrollManager.addEventListener('scroll', this.__scrollHandler);
                });
            }
        },

        __setupSectionObservers() {
            let element;
            let component;
            let treshold;
            let oberserverIndex = 0;
            let index;
            const baseTreshold = Breakpoints.active('medium') ? 0.3 : 0.1;
            for (let i = 0, len = this.__sections.length; i < len; i++) {
                element = this.__sections[i];
                component = element.__vue__;
                treshold = component.intersectionObserverTreshold ? component.intersectionObserverTreshold : baseTreshold;

                this.__observers[oberserverIndex] = new IntersectionObserver(
                    (entries, observer) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                this.__activeSectionIndex = i;
                                this.__activeSection = entry.target.__vue__;
                                if (typeof entry.target.__vue__.show === 'function') {
                                    entry.target.__vue__.show();
                                }
                                // observer.disconnect();
                            }
                        });
                    },
                    {
                        threshold: [treshold],
                    }
                );
                this.__observers[oberserverIndex].observe(element);
                oberserverIndex++;
            }
        },

        __disconnectSectionObservers() {
            for (let i = 0, len = this.__observers.length; i < len; i++) {
                this.__observers[i].disconnect();
            }
        },

        __updateParallax(position) {
            let item;
            let component;
            let sectionInfo;
            for (let i = 0, len = this.__sections.length; i < len; i++) {
                item = this.__sections[i];
                component = item.__vue__;
                sectionInfo = this.$root.sectionsInfo[i];
                if (component && typeof component.parallax === 'function') {
                    component.parallax(position, sectionInfo);
                }
            }
        },

        __getBaseRouteName(name) {
            const split = name.split('__');
            let baseName = split[0];
            if (baseName === 'index') baseName = 'home';
            return baseName;
        },

        // __focusActiveSection(target) {
        //     if (this.$store.state.router.current !== 'index') return;

        //     const isButton = target.closest('a, button, .dg');
        //     if (isButton) return;

        //     this._isFocusActive = true;
        //     this.$store.commit('focus', FOCUS_STARTED);

        //     if (this.$root.webglApp) {
        //         this.$root.webglApp.focus(this.__activeSectionIndex);
        //     }

        //     if (this.__activeSection && typeof this.__activeSection.focus === 'function') {
        //         this.__activeSection.focus();

        //         if (this.$root.theNavigation) {
        //             this.$root.theNavigation.focusFadeOut();
        //         }
        //         //Button Muting
        //         // if (this.$root.buttonMute) {
        //         //     this.$root.buttonMute.fadeOut();
        //         // }
        //     }
        // },

        // __unfocusActiveSection() {
        //     if (this.$store.state.router.current !== 'index') return;

        //     if (!this._isFocusActive) return;
        //     this._isFocusActive = false;
        //     this.$store.commit('focus', FOCUS_ENDED);

        //     if (this.$root.webglApp) {
        //         this.$root.webglApp.unfocus();
        //     }

        //     if (this.__activeSection && typeof this.__activeSection.unfocus === 'function') {
        //         this.__activeSection.unfocus();

        //         if (this.$root.theNavigation) {
        //             this.$root.theNavigation.focusFadeIn();
        //         }
        //         // Button Muting
        //         // if (this.$root.buttonMute) {
        //         //     this.$root.buttonMute.fadeIn();
        //         // }
        //     }
        // },

        /**
         * Resize
         */
        __resize() {
            this.$root.sectionsInfo = this.__getSectionsInfo();
        },

        __getSectionsInfo() {
            const sections = this.$el.querySelectorAll('section');
            const info = [];

            let item;
            let component;
            let dimensions;
            let position;
            let scrollType;

            for (let i = 0, len = sections.length; i < len; i++) {
                item = sections[i];

                component = item.__vue__;

                dimensions = {
                    width: item.offsetWidth,
                    height: item.offsetHeight,
                };

                position = {
                    x: 0,
                    y: helpers.globalOffsetTop(item),
                };

                scrollType = item.__vue__.scrollType;

                info[i] = {
                    component,
                    dimensions,
                    position,
                    scrollType,
                };
            }

            return info;
        },

        /**
         * Handlers
         */
        __preloaderChangeHandler(state) {
            if (state === PRELOADER_COMPLETED) {
                if (page && typeof page.transitionIn === 'function') {
                    this.$nextTick(() => {
                        page.transitionIn(null, routeInfo);
                    });
                }
            }
        },

        __resizeHandler() {
            this.__resize();
        },

        // __mouseDownHandler(e) {
        //     this.__focusActiveSection(e.target);
        // },

        // __mouseUpHandler() {
        //     this.__unfocusActiveSection();
        // },

        // __touchStartHandler(e) {
        //     this.__touchStartPosition.x = e.touches[0].clientX;
        //     this.__touchStartPosition.y = e.touches[0].clientY;

        //     this.__focusTimeout = setTimeout(() => {
        //         this.__focusActiveSection(e.target);
        //     }, 150);
        // },

        // __touchMoveHandler(e) {
        //     const deltaX = Math.abs(this.__touchStartPosition.x - e.touches[0].clientX);
        //     const deltaY = Math.abs(this.__touchStartPosition.y - e.touches[0].clientY);
        //     const maxDelta = 10;
        //     if (deltaX > maxDelta || deltaY > maxDelta) {
        //         clearTimeout(this.__focusTimeout);
        //     }
        // },

        // __touchEndHandler() {
        //     this.__unfocusActiveSection();
        // },

        __scrollHandler(position) {
            this.__updateParallax(position);
        },
    },
};
