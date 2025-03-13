export default ({ store }) => {
    const date = new Date();
    const year = date.getFullYear();
    store.commit('setCopyright', year);
};
