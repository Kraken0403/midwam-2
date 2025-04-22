import landscapesData from '@/webgl/configs/landscapes';

/**
 * Fonts
 */
const fonts = [
    {
        type: 'font',
        name: 'Akkurat Pro',
        weight: 300,
    },
    {
        type: 'font',
        name: 'Akkurat Pro',
        weight: 400,
    },
    {
        type: 'font',
        name: 'Akkurat Pro',
        weight: 700,
    },
    {
        type: 'font',
        name: 'Formula Condensed',
        weight: 250,
    },
    {
        type: 'font',
        name: 'Formula Condensed',
        weight: 300,
    },
    {
        type: 'font',
        name: 'Formula Condensed',
        weight: 400,
    },
    {
        type: 'font',
        name: 'Rajdhani',
        weight: 400,
    },
    {
        type: 'font',
        name: 'Rajdhani',
        weight: 600,
    },
    {
        type: 'font',
        name: 'Tajawal',
        weight: 400,
    },
    {
        type: 'font',
        name: 'Tajawal',
        weight: 500,
    },
];

/**
 * Webgl
 */
const webgl = [
    {
        type: 'gltf',
        name: 'human',
        path: '/assets/models/human.glb',
    },
    {
        type: 'gltf',
        name: 'heart',
        path: '/assets/models/heart.glb',
    },
    {
        type: 'gltf',
        name: 'spinner-about',
        path: '/assets/models/spinner-about.glb',
    },
    {
        type: 'gltf',
        name: 'spinner-services',
        path: '/assets/models/spinner-services.glb',
    },
    {
        type: 'gltf',
        name: 'spinner-home',
        path: '/assets/models/spinner-home.glb',
    },
    {
        type: 'gltf',
        name: 'spinner-portfolio',
        path: '/assets/models/spinner-home.glb',
    },
    {
        type: 'gltf',
        name: 'shapes',
        path: '/assets/models/shapes.glb',
    },
    {
        type: 'gltf',
        name: 'camera',
        path: '/assets/models/camera.glb',
    },
    {
        type: 'obj',
        name: 'city-contact',
        path: '/assets/models/city-contact.obj',
    },
    {
        type: 'image',
        name: 'environment-map',
        path: '/assets/images/environment-map.jpg',
    },
    {
        type: 'image',
        name: 'floor',
        path: '/assets/images/floor.jpg',
    },
    {
        type: 'image',
        name: 'floor-home',
        path: '/assets/images/floor-home.jpg',
    },
    {
        type: 'image',
        name: 'logo',
        path: '/assets/images/logo.png',
    },
    // {
    //     type: 'image',
    //     name: 'test-image',
    //     path: '/assets/images/test-image.jpg',
    // },
];

/**
 * Sounds
 */
const sounds = [
    {
        type: 'sound',
        name: 'background-loop-1',
        path: '/assets/sounds/background-loop-1.mp3',
    },
    {
        type: 'sound',
        name: 'background-loop-2',
        path: '/assets/sounds/background-loop-2.mp3',
    },
    {
        type: 'sound',
        name: 'background-loop-3',
        path: '/assets/sounds/background-loop-3.mp3',
    },
    {
        type: 'sound',
        name: 'transition',
        path: '/assets/sounds/transition.mp3',
    },
    {
        type: 'sound',
        name: 'energy',
        path: '/assets/sounds/energy.mp3',
    },
];

/**
 * Landscapes
 */
let item;
const landscapes = [];
for (let i = 0, len = landscapesData.length; i < len; i++) {
    item = landscapesData[i];
    landscapes.push({
        type: 'obj',
        name: item.name,
        path: item.model,
    });
}

const resources = [...fonts, ...webgl, ...landscapes, ...sounds];
export default resources;
