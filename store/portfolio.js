export const state = () => ({
    items: [],
    categories: [],
});

export const mutations = {
    items(state, value) {
        state.items = value;
    },

    categories(state, value) {
        state.categories = value;
    },
};
