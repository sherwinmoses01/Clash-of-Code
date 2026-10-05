// Web Audio API Synthesizer & BGM Engine for Clash of Code

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.bgmEnabled = true;
    this.bgmAudio = null;
    this.bgmStarted = false;
  }

  // Internal helper: play an array of {freq, delay, duration, gain, type} tones
  _playTones(tones) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      tones.forEach(({ freq, delay = 0, duration = 0.15, gainVal = 0.08, type = 'sine' }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(gainVal, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + duration + 0.01);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Littleroot Town BGM Controller
  initBGM() {
    if (this.bgmAudio) return;
    this.bgmAudio = new Audio('/assets/littleroot.mp3');
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = 0.38; // Pleasant background volume
  }

  startBGM() {
    this.initBGM();
    if (!this.bgmEnabled || this.bgmStarted) return;
    
    this.bgmAudio.play().then(() => {
      this.bgmStarted = true;
      const bgmBadge = document.getElementById('bgm-track-indicator');
      if (bgmBadge) bgmBadge.classList.add('playing');
    }).catch(err => {
      // Browser autoplay policy blocked until first click
      console.log('BGM autoplay awaiting user interaction:', err);
    });
  }

  toggleBGM() {
    this.initBGM();
    this.bgmEnabled = !this.bgmEnabled;
    const bgmBadge = document.getElementById('bgm-track-indicator');

    if (this.bgmEnabled) {
      this.bgmAudio.play();
      this.bgmStarted = true;
      if (bgmBadge) bgmBadge.classList.add('playing');
    } else {
      this.bgmAudio.pause();
      this.bgmStarted = false;
      if (bgmBadge) bgmBadge.classList.remove('playing');
    }
    return this.bgmEnabled;
  }

  // Crosshair Tactical Lock-on SFX
  playCrosshair() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);
      osc.frequency.setValueAtTime(1900, now + 0.045);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.09);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  playHover() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, this.ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  playBattle() {
    this._playTones([
      { freq: 330, delay: 0.00, duration: 0.25, gainVal: 0.08, type: 'sawtooth' },
      { freq: 440, delay: 0.07, duration: 0.25, gainVal: 0.08, type: 'sawtooth' },
      { freq: 554, delay: 0.14, duration: 0.25, gainVal: 0.08, type: 'sawtooth' },
      { freq: 659, delay: 0.21, duration: 0.25, gainVal: 0.08, type: 'sawtooth' },
    ]);
  }

  playReward() {
    this._playTones([
      { freq: 523.25, delay: 0.00, duration: 0.30, gainVal: 0.10 },
      { freq: 659.25, delay: 0.06, duration: 0.30, gainVal: 0.10 },
      { freq: 783.99, delay: 0.12, duration: 0.30, gainVal: 0.10 },
      { freq: 1046.50, delay: 0.18, duration: 0.30, gainVal: 0.10 },
    ]);
  }

  // Alias used by learn.js for problem completion celebration
  playWin() {
    this.playReward();
  }

  playModalOpen() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  playModalClose() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.11);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.11);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }
}

export const sounds = new SoundEngine();

/**
 * Shared tactical crosshair effect — spawns a brief animated burst at (x, y).
 * @param {number} x - clientX coordinate
 * @param {number} y - clientY coordinate
 * @param {SoundEngine} soundEngine - the sounds instance to play SFX
 * @param {HTMLElement|null} container - the #crosshair-container element
 * @param {boolean} [showCoords=false] - whether to show LOC coordinates label
 */
export function spawnCrosshair(x, y, soundEngine, container, showCoords = false) {
  if (!container) return;
  soundEngine.playCrosshair();

  const burst = document.createElement('div');
  burst.className = 'crosshair-burst';
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;

  burst.innerHTML = `
    <div class="crosshair-ring"></div>
    <div class="crosshair-corners"></div>
    <div class="crosshair-center-dot"></div>
    ${showCoords ? `<div class="crosshair-coords">LOC [${Math.round(x)}, ${Math.round(y)}] // LOCK</div>` : ''}
  `;

  container.appendChild(burst);
  setTimeout(() => burst.remove(), 550);
}
