// Vendor
import gsap from 'gsap';

export default {
  _goto(index, direction) {
    const from = this._currentSectionIndex;
    const to = index;

    if (from === to) return;

    const step = direction > 0 ? 1 : -1;
    const stepsSkipped = Math.abs(to - from);
    const speedMultiplier = 1 / stepsSkipped;

    const tl = gsap.timeline();

    for (let i = from + step; direction > 0 ? i <= to : i >= to; i += step) {
      const fn = this[`_showSection${i}`];
      if (typeof fn === 'function') {
        const result = fn.call(this, step, speedMultiplier);
        if (result && typeof result.add === 'function') {
          tl.add(result, '+=0.01');
        } else {
          tl.to({}, { duration: 0.01 });
        }
      }
    }

    this._currentSectionIndex = to;
  },

  _showSection0(dir = 1, speed = 1) {
    const tl = gsap.timeline();
    tl.to(this._camera.position, {
      duration: 1 * speed,
      x: 0,
      y: 10,
      z: 3,
      ease: 'power2.inOut',
      onUpdate: () => this._camera.lookAt(0, 0, 0),
    });
    return tl;
  },

  _showSection1(dir = 1, speed = 1) {
    const tl = gsap.timeline();
  
    // ✅ Always use y:1, z:8 for Section 1
    const targetY = 1;
    const targetZ = 8;
  
    // ✅ Camera animation
    tl.to(this._camera.position, {
      duration: 1 * speed,
      x: 0,
      y: targetY,
      z: targetZ,
      ease: 'power2.inOut',
      onUpdate: () => this._camera.lookAt(0, 0, 0),
    });
  
    // ✅ Spinner return to center if scrolling up
    if (dir < 0 && this._components?.spinner) {
      tl.to(this._components.spinner.position, {
        x: 0,
        y: -0.95,
        z: 0,
        duration: 1 * speed,
        ease: 'power3.inOut',
      }, 0);
    }
  
    return tl;
  }
  
  ,

  _showSection2(dir = 1, speed = 1) {
    const tl = gsap.timeline();
    const cam = this._camera;
    const spinner = this._components?.spinner;
    const services = this._components?.servicesPlanes;
  
    // ✅ FORWARD: move spinner to service zone
    if (dir > 0 && spinner) {
      tl.to(spinner.position, {
        x: -10,
        y: -1,
        z: 10,
        duration: 1 * speed,
        ease: 'power3.inOut',
      }, 0);
    }
  
    // ✅ REVERSE: fade out service planes
    if (dir < 0 && services) {
      services.visible = true;
      services.userData.opacity = 1;
  
      tl.to(services.userData, {
        opacity: 0,
        duration: 0.5 * speed,
        ease: 'power2.out',
        onUpdate: () => {
          services.children.forEach((child) => {
            if (child.material) {
              child.material.opacity = services.userData.opacity;
            }
          });
        },
        onComplete: () => {
          services.visible = false;
        }
      }, 0);
    }
  
    // ✅ REVERSE: reset camera to Section 1 position (0,1,8)
    if (dir < 0 && cam) {
      const targetPos = { x: 0, y: 1, z: 8 };
      const targetLook = { x: 0, y: 0, z: 0 };
  
      tl.to(cam.position, {
        ...targetPos,
        duration: 1.2 * speed,
        ease: 'power2.inOut',
        onUpdate: () => {
          cam.lookAt(targetLook.x, targetLook.y, targetLook.z);
        }
      }, 0);
    }
  
    return tl;
  }
  
  ,

  _showSection3(dir = 1, speed = 1) {
    const tl = gsap.timeline();
    const cam = this._camera;
    const target = this._cameraB;
    const services = this._components?.servicesPlanes;
  
    if (!cam || !target) return tl;
  
    const targetPos = target.position.clone();
    const targetQuat = target.quaternion.clone();
  
    // ✅ Step 1: Interpolate camera to cameraB
    tl.to(cam.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.5 * speed,
      ease: 'power2.inOut',
    }, 0);
  
    tl.to(cam.quaternion, {
      x: targetQuat.x,
      y: targetQuat.y,
      z: targetQuat.z,
      w: targetQuat.w,
      duration: 1.5 * speed,
      ease: 'power2.inOut',
    }, 0);
  
    // ✅ Step 2: After camera movement, fade in planes
    if (services) {
      services.visible = true;
      services.userData.opacity = 0;
  
      tl.to(services.userData, {
        opacity: 1,
        duration: 1.2 * speed,
        ease: 'power2.out',
        onUpdate: () => {
          services.children.forEach((child) => {
            if (child.material) {
              child.material.transparent = true;
              child.material.opacity = services.userData.opacity;
            }
          });
        }
      }, '+=0.2'); // ✅ Start after camera animation ends
    }
  
    return tl;
  }
  ,

  _showSection4(dir = 1, speed = 1) {
    const tl = gsap.timeline();
    const cam = this._camera;
    const target = this._cameraC;
    const services = this._components?.servicesPlanes;

    if (services) {
      services.visible = true;
      tl.to(services.userData, {
        opacity: 0,
        duration: 0.8 * speed,
        ease: 'power2.inOut',
        onUpdate: () => {
          services.children.forEach((child) => {
            if (child.material) {
              child.material.opacity = services.userData.opacity;
            }
          });
        },
        onComplete: () => {
          services.visible = false;
        }
      }, 0); // start immediately
    }

    if (cam && target) {
      const targetPos = target.position.clone();
      const targetQuat = target.quaternion.clone();

      tl.to(cam.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.2 * speed,
        ease: 'power2.inOut'
      }, '-=0.6');

      tl.to(cam.quaternion, {
        x: targetQuat.x,
        y: targetQuat.y,
        z: targetQuat.z,
        w: targetQuat.w,
        duration: 1.2 * speed,
        ease: 'power2.inOut'
      }, '-=1.2');
    }

    return tl;
  }
};
