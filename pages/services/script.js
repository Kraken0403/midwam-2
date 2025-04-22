// pages/services.js

import gsap from 'gsap'
import Page from '@/components/Page'
import ScrollControl from '@/components/ScrollControlAbout'
import SectionHeader from '@/sections/services/Header'
import ServiceItemSection from '@/sections/services/ServiceItemSection'
import SectionFooter from '@/sections/shared/Footer'

export default {
  extends: Page,

  components: {
    ScrollControl,
    SectionHeader,
    ServiceItemSection,
    SectionFooter,
  },

  created() {
    // let GSAP ScrollTrigger work on this page
    this.scrollTriggers = true
  },

//   mounted() {
//     // on full reload, make sure Services scene is active
//     if (this.$root.webglApp) {
//       this.$root.webglApp.hideScene()
//       this.$root.webglApp.showScene('services')
//     }
//   },

  methods: {
    transitionIn(done, routInfo) {
      // hook up your custom scroll
      this.$refs.scrollControl.enable()
      this.disablePageBounce()

      const delay = routInfo.previous === null ? 0 : 0;
      // immediately swap WebGL scenes
    //   if (this.$root.webglApp) {
    //     this.$root.webglApp.hideScene()
    //     this.$root.webglApp.showScene('services')
    //   }

      const tl = gsap.timeline({ onComplete: done, delay })
      if (this.$root.webglApp) tl.add(this.$root.webglApp.showScene('about'), 0);

      // animate your header in (if you have one)
      if (this.$refs.header && this.$refs.header.transitionIn) {
        tl.add(this.$refs.header.transitionIn(), 0.3)
      }

      // fade & slide the services items up into place
      tl.fromTo(
        this.$refs.servicesitem.$el,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, ease: 'power2.out', duration: 1 },
        0.8
      )

      // finally bring the nav back
      tl.add(this.$root.theNavigation.show(), 1)

      return tl
    },

    transitionOut(done) {
      this.enablePageBounce()
      const tl = gsap.timeline({ onComplete: done })

      if (this.$root.webglApp) tl.add(this.$root.webglApp.hideScene(), 0);

      // fade the Vue page out
      tl.to(this.$el, { duration: 0.8, alpha: 0, ease: 'sine.inOut' }, 0)

      // restore your static background
      tl.set(this.$root.webglBackground.$el, { opacity: 1 }, 0.8)

      // reset any offset
      tl.call(() => {
        const scene = this.$root.webglApp.getScene('about')
        if (scene && scene._container) scene._container.position.y = 0
      }, null, 0.8)

      return tl
    },

    enablePageBounce() {
      document.documentElement.classList.remove('prevent-bounce')
    },
    disablePageBounce() {
      document.documentElement.classList.add('prevent-bounce')
    },
  },
}
