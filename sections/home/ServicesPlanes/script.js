export default {
  data() {
    return {
      items: ['Web Design', 'Branding', 'Development'],
      activeIndex: 0,
      scene: null,
      isDragging: false,
      dragStartX: 0,
    };
  },

  mounted() {
    this.scene = this.$root.webglApp?.getScene('home');
    console.log('[ServicesPlanes] mounted: scene =', this.scene);

    this.$el.addEventListener('mousedown', this.startDrag);
    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.endDrag);
  },

  beforeDestroy() {
    this.$el.removeEventListener('mousedown', this.startDrag);
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.endDrag);
  },

  methods: {
    goToIndex(index) {
      console.log('[ServicesPlanes] goToIndex clicked:', index);
      this.activeIndex = index;
      this.scene?.goToIndex?.(index);
    },

    prev() {
      const index = this.activeIndex - 1;
      console.log('[ServicesPlanes] prev clicked');
      if (index >= 0) this.goToIndex(index);
    },

    next() {
      const index = this.activeIndex + 1;
      console.log('[ServicesPlanes] next clicked');
      if (index < this.items.length) this.goToIndex(index);
    },

    startDrag(e) {
      console.log('[ServicesPlanes] startDrag');
      this.isDragging = true;
      this.dragStartX = e.clientX;
    },

    onDrag(e) {
      if (!this.isDragging) return;
      const deltaX = this.dragStartX - e.clientX;
      this.dragStartX = e.clientX;

      console.log('[ServicesPlanes] onDrag deltaX:', deltaX);
      this.scene?.dragHandler?.(deltaX);
    },

    endDrag() {
      if (!this.isDragging) return;
      this.isDragging = false;
      console.log('[ServicesPlanes] endDrag');
      this.scene?.dragEndHandler?.();
    },
  },
};
