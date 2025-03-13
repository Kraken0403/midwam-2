export const PRELOADER_STARTED = 'STARTED';
export const PRELOADER_ASSETS_LOADED = 'ASSETS_LOADED';
export const PRELOADER_COMPLETED = 'COMPLETED';

export const FOCUS_STARTED = 'STARTED';
export const FOCUS_ENDED = 'ENDED';

export const LANGUAGE_SWITCH_STARTED = 'LANGUAGE_SWITCH_STARTED';
export const LANGUAGE_SWITCH_FINISHED = 'LANGUAGE_SWITCH_FINISHED';

export const state = () => ({
    preloader: null,
    focus: null,
    languageSwitch: null,
    errorPageActive: false,
    aboutScrollLock: false,
    copyright: null,
});

export const mutations = {
    preloader(state, value) {
        state.preloader = value;
    },

    focus(state, value) {
        state.focus = value;
    },

    languageSwitch(state, value) {
        state.languageSwitch = value;
    },

    errorPageActive(state, value) {
        state.errorPageActive = value;
    },

    aboutScrollLock(state, value) {
        state.aboutScrollLock = value;
    },

    setCopyright(state, value) {
        state.copyright = value;
    },
};
