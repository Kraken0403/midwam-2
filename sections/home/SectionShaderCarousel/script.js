
export default {
    mounted() {
      if (process.client) {
        // Load external scripts dynamically
        const loadScript = (src) =>
          new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
  
        Promise.all([
          loadScript('/js/jQuery.js'),
          loadScript('/js/FWDSC.js'),
          loadScript('/js/FWDSI.js'),
          loadScript('/js/FWDVS.js'),
          loadScript('/js/Lenis.js'),
        ])
          .then(() => {
            return loadScript('/js/main.js');
          })
          .catch((err) => {
            console.error('Failed to load carousel scripts', err);
          });
      }
    },
  };
  