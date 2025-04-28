// Vendor
import gsap from 'gsap';

export default {
    _goto(index, direction) {
        const previousIndex = this._currentSectionIndex;

        switch (previousIndex) {
            case 0:
                this._hideSection0();
                break;
            case 1:
                this._hideSection1();
                break;
            case 2:
                this._hideSection2();
                break;
        }

        this._currentSectionIndex = index;

        switch (this._currentSectionIndex) {
            case 0:
                this._showSection0(direction);
                break;
            case 1:
                this._showSection1(direction);
                break;
            case 2:
                this._showSection2(direction);
                break;
        }
    },

    _resetSectionTimelines() {
        if (this._timelineSection0Show) this._timelineSection0Show.kill();
        if (this._timelineSection1Show) this._timelineSection1Show.kill();
        if (this._timelineSection2Show) this._timelineSection2Show.kill();
    },

    /**
     * Section 0 — Spinner centered, top view
     */
    _showSection0(direction) {
        this._timelineSection0Show = gsap.timeline();

        this._timelineSection0Show.to(this._cameraAnimation, {
            duration: 1.5,
            mouseRotationXOffset: 0,
            mouseRotationYOffset: 0,
            zoomZ: 9,
            ease: 'power2.out',
        }, 0);

        this._timelineSection0Show.to(this._components.spinner.position, {
            duration: 1.5,
            x: 0,
            ease: 'power2.out',
        }, 0);

        this._timelineSection0Show.to(this._components.spinner.scale, {
            duration: 1.5,
            x: 1,
            y: 1,
            z: 1,
            ease: 'power2.out',
        }, 0);

        this._timelineSection0Show.call(() => {
            this._components.spinner.showSparks();
        }, null, 0.5);
    },

    _hideSection0() {},

    /**
     * Section 1 — Spinner moves left
     */
    _showSection1(direction) {
        this._timelineSection1Show = gsap.timeline();

        this._timelineSection1Show.to(this._cameraAnimation, {
            duration: 2,
            mouseRotationXOffset: 1.5,
            mouseRotationYOffset: 0.1,
            zoomZ: 7,
            ease: 'power2.inOut',
        }, 0);

        this._timelineSection1Show.to(this._components.spinner.position, {
            duration: 2,
            x: -2.5,
            ease: 'power2.inOut',
        }, 0);
    },

    _hideSection1() {},

    /**
     * Section 2 — Spinner moves right
     */
    _showSection2(direction) {
        this._timelineSection2Show = gsap.timeline();

        this._timelineSection2Show.to(this._cameraAnimation, {
            duration: 2,
            mouseRotationXOffset: -1.5,
            mouseRotationYOffset: 0.1,
            zoomZ: 7,
            ease: 'power2.inOut',
        }, 0);

        this._timelineSection2Show.to(this._components.spinner.position, {
            duration: 2,
            x: 2.5,
            ease: 'power2.inOut',
        }, 0);
    },

    _hideSection2() {},
};
