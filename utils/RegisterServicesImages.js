// utils/RegisterServicesImages.js

import ResourceLoader from '@/utils/ResourceLoader';

export default function RegisterServicesImages(services) {
  const loads = services.map(item => {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = '';
      img.onload = () => {
        // now ResourceLoader.get(item.slug) will return this img
        ResourceLoader.add(item.slug, img);
        resolve();
      };
      img.src = item.image.sizes['1920x0'].url;
    });
  });

  return Promise.all(loads);
}
