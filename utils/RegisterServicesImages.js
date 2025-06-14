import ResourceLoader from '@/utils/ResourceLoader';

export default function registerServiceImages(servicesItems) {
  for (const item of servicesItems) {
    const slug = item.slug;

    const url =
      item.image?.sizes?.['1920x0']?.url ||
      item.image?.sizes?.['1366x0']?.url ||
      item.image?.sizes?.['1024x0']?.url;

    if (!slug || !url) {
      console.warn(`[registerServiceImages] Invalid image or slug:`, item);
      continue;
    }

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = url;

    image.onload = () => {
      ResourceLoader.add(slug, image);
      console.log(`[registerServiceImages] Loaded image for ${slug}`);
    };

    image.onerror = (e) => {
      console.error(`[registerServiceImages] Failed to load image for ${slug}`, e);
    };
  }
}
