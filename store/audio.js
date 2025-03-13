export const state = () => ({
    isMuted: true,
});

export const mutations = {
    mute(state) {
        state.isMuted = true;
    },

    unmute(state) {
        state.isMuted = false;
    },
};
