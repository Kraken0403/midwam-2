export const state = () => ({
    previous: null,
    current: null,
});

export const mutations = {
    previous(state, value) {
        state.previous = value;
    },

    current(state, value) {
        state.current = value;
    },
};
