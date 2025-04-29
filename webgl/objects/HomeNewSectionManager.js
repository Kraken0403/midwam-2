// Vendor
import gsap from 'gsap';

export default {
    _goto(index, direction) {
        this._currentSectionIndex = index;

        switch (index) {
            case 0: this._showSection0(); break;
            case 1: this._showSection1(); break;
            case 2: this._showSection2(); break;
            case 3: this._showSection3(); break;
            case 4: this._showSection4(); break;
            case 5: this._showSection5(); break;
            case 6: this._showSection6(); break;
            case 7: this._showSection7(); break;
            case 8: this._showSection8(); break;
        }
    },

    /**
     * Section 0 — Spinner centered, camera back
     */
    
    _showSection0() {
        const tl = gsap.timeline();
        console.log('hey')

        // tl.to(this._group.position, {
        //     duration: 1.5,
        //     x: -2,
        //     ease: 'power2.inOut',
        // }, 0);

        tl.to(this._camera.position, {
            duration: 1.5,
            x: 0,
            y: 10,
            z: 3,
            ease: 'power2.inOut',
            onUpdate: () => this._camera.lookAt(this._group.position),
        }, 0);
    },

    /**
     * Section 1 — Spinner shifts left
     */
    _showSection1() {
        const tl = gsap.timeline();
        console.log('hey 2')

        // tl.to(this._group.position, {
        //     duration: 1.5,
        //     x: -2,
        //     ease: 'power2.inOut',
        // }, 0);

        tl.to(this._camera.position, {
            duration: 1.5,
            x: 0,
            y: 0,
            z: 10,
            ease: 'power2.inOut',
            onUpdate: () => this._camera.lookAt(this._group.position),
        }, 0);
    },

    /**
     * Section 2 — Spinner shifts right
     */
    _showSection2() {
        const tl = gsap.timeline();
        console.log('hey 3')

        // tl.to(this._group.position, {
        //     duration: 1.5,
        //     x: 2,
        //     ease: 'power2.inOut',
        // }, 0);

        tl.to(this._camera.position, {
            duration: 1.5,
            x: 1.5,
            y: 5,
            z: 7,
            ease: 'power2.inOut',
            onUpdate: () => this._camera.lookAt(this._group.position),
        }, 0);
    },

    /**
     * Section 3 — Spinner left
     */
    _showSection3() {
        const tl = gsap.timeline();

        // tl.to(this._group.position, {
        //     duration: 1.5,
        //     x: -2.5,
        //     ease: 'power2.inOut',
        // }, 0);
    },

    /**
     * Section 4 — Spinner right
     */
    _showSection4() {

    },

    /**
     * Section 5 — Center spinner again
     */
    _showSection5() {

    },

    /**
     * Section 6 — Slight zoom
     */
    _showSection6() {

    },

    /**
     * Section 7 — Reset zoom, center
     */
    _showSection7() {

    },

    /**
     * Section 8 — Shrink spinner (footer)
     */
    _showSection8() {
      
    }
};
