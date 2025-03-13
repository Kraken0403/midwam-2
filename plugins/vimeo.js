import axios from './axios';

const vimeo = {
    getVideo(url, id) {
        return axios.get(url);
    },
};

export default vimeo;
