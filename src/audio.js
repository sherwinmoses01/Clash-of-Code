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

  // Celebratory Level-Up Fanfare
  playLevelUp() {
    this._playTones([
      { freq: 440.00, delay: 0.00, duration: 0.14, gainVal: 0.12, type: 'triangle' }, // A4
      { freq: 554.37, delay: 0.12, duration: 0.14, gainVal: 0.13, type: 'triangle' }, // C#5
      { freq: 659.25, delay: 0.24, duration: 0.16, gainVal: 0.15, type: 'triangle' }, // E5
      { freq: 880.00, delay: 0.38, duration: 0.40, gainVal: 0.18, type: 'square' },   // A5
      { freq: 1108.73, delay: 0.52, duration: 0.60, gainVal: 0.20, type: 'triangle' } // C#6
    ]);
  }
}

export const sounds = new SoundEngine();

/**
 * Shared tactical crosshair effect — spawns a brief animated burst at (x, y).
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

/**
 * Global Celebratory Level-Up Overlay Dialog
 */
export function showLevelUpCelebration(newLevel, title = 'Syntax Master', bonusCp = 150) {
  sounds.playLevelUp();

  // Remove any existing levelup modal
  const existing = document.getElementById('clash-levelup-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'clash-levelup-overlay';
  overlay.className = 'levelup-overlay active';
  overlay.innerHTML = `
    <div class="levelup-dialog" role="dialog" aria-modal="true">
      <div class="levelup-sparkles"></div>
      <div class="levelup-glow-ring"></div>
      
      <div class="levelup-header">
        <span class="levelup-badge-pill">MASTERY PROMOTION</span>
        <h2 class="levelup-headline">LEVEL UP!</h2>
      </div>

      <div class="levelup-rank-disc">
        <span class="levelup-tier-text">TIER PROMOTED</span>
        <span class="levelup-level-num">${newLevel}</span>
        <span class="levelup-title-tag">${title}</span>
      </div>

      <p class="levelup-congrats">
        Outstanding performance, Pilot! Your algorithmic synaptic latency has evolved to a higher tier.
      </p>

      <div class="levelup-reward-capsule">
        <span class="reward-lbl">LEVEL PROMOTION BONUS:</span>
        <strong class="reward-val">+${bonusCp} CP REWARDED</strong>
      </div>

      <button type="button" class="levelup-btn" id="btn-close-levelup">
        <span>⚡ CLAIM REWARD &amp; RETURN TO BATTLE</span>
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('#btn-close-levelup');
  const close = () => {
    sounds.playReward();
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  };

  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
}

// Global Event Listener for Level Up Across ALL Pages
if (typeof window !== 'undefined') {
  window.addEventListener('clashofcode:levelup', (e) => {
    const detail = e.detail || {};
    const newLvl = detail.newLevel ?? 1;
    const title = detail.title || 'Syntax Sentinel';
    const bonusCp = detail.bonusCp || 150;
    showLevelUpCelebration(newLvl, title, bonusCp);
  });
}
