export const state = () => ({
    activeCategory: null,
    activeItems: [],
});

export const mutations = {
    setActiveCategory(state, value) {
        state.activeCategory = value;
    },

    setActiveItems(state, value) {
        state.activeItems = value;
    },
};
