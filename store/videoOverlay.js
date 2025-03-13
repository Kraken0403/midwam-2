export const state = () => ({
    isOpen: false,
    data: null,
});

export const mutations = {
    open(state, value) {
        state.isOpen = true;
    },

    close(state, value) {
        state.isOpen = false;
    },

    data(state, value) {
        state.data = value;
    },
};
