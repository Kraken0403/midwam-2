// Scenes
import Home from '@/webgl/scenes/Home';
import About from '@/webgl/scenes/About';
import Contact from '@/webgl/scenes/Contact';
import Portfolio from '@/webgl/scenes/Portfolio';
import Empty from '@/webgl/scenes/Empty';
import Services from '@/webgl/scenes/Services';

export default {
    home: {
        class: Home,
    },
    about: {
        class: About,
    },
    services:{ 
        class: Services, 
    },
    contact: {
        class: Contact,
    },
    portfolio: {
        class: Portfolio,
    },
    empty: {
        class: Empty,
    },
};
