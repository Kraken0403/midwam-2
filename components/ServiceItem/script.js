// Vendor
import Arrow from '@/assets/images/icons/service-arrow.svg?inline';
import ServImage from '@/assets/images/about/video.png';

export default {
  name: "ServiceItem",
  // Only register actual Vue components:
  components: {
    Arrow
  },
  data() {
    return {
      // Add the imported image URL as a data property
      servImage: ServImage
    };
  },
  methods: {
    // your methods if any
  }
};
