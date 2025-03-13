// Vendor
import gsap from 'gsap';
import Pizzicato from 'pizzicato';

// Constants
const VOLUME = 0.5;

class AudioManager {
    constructor() {
        this._tracks = {};
        this._current = null;
        this._isMuted = false;
    }

    /**
     * Public
     */
    add(name, track) {
        this._tracks[name] = track;
    }

    play(name, options) {
        if (!this._tracks[name]) return;

        const next = this._tracks[name];
        if (this._current === next) return;

        if (this._current) {
            this._current.pause();
        }

        this._current = next;
        this._current.loop = options.loop || false;
        this._current.volume = VOLUME;
        this._current.attack = 0.5;
        this._current.release = 2;
        this._current.play();
    }

    playEffect(name) {
        if (!this._tracks[name]) return;

        const track = this._tracks[name];

        track.volume = VOLUME;
        track.release = 2;
        track.stop();
        track.play();
    }

    stopEffect(name) {
        if (!this._tracks[name]) return;

        const track = this._tracks[name];
        track.stop();
    }

    toggleMute() {
        if (this._isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
        return this._isMuted;
    }

    mute() {
        if (this._isMuted) return;
        this._isMuted = true;
        gsap.to(Pizzicato, 1, { volume: 0 });
    }

    unmute() {
        if (!this._isMuted) return;
        this._isMuted = false;
        gsap.to(Pizzicato, 1, { volume: VOLUME });
    }
}

export default new AudioManager();
