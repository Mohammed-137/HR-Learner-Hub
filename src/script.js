/**
 * ============================================================================
 * HR LEARNER HUB — GRAND DIWALI CELEBRATION EXPERIENCE
 * Complete Cinematic Sequence:
 *   1. Man in traditional festive attire walks in carrying firework rocket.
 *   2. Sets rocket in launch stand & lights fuse with glowing sparkler wand.
 *   3. Sizzling sparks, smoke, and lighting effects.
 *   4. Man retreats safely; rocket launches rapidly with golden particle trail.
 *   5. Spectacular multi-layered fireworks explosion (Gold, Red, Blue, Purple, Orange).
 *   6. Elegant Diwali Greeting Reveal:
 *        - "HAPPY DIWALI!"
 *        - "HR LEARNER HUB"
 *        - "Wishes to All Mentors and Learners"
 *   7. Ambient continuing celebration fireworks, twinkling stars & glowing diyas.
 *   8. Built-in Web Audio API sound synthesis, replay button & full responsiveness.
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Canvas & DOM Elements ---
  const canvas = document.getElementById('c');
  if (!canvas) throw new Error("Canvas element with id 'c' not found.");
  const ctx = canvas.getContext('2d');

  const greetingOverlay = document.getElementById('greeting-overlay');
  const btnReplay = document.getElementById('btn-replay');
  const btnCardReplay = document.getElementById('btn-card-replay');
  const btnSound = document.getElementById('btn-sound');
  const soundText = document.getElementById('sound-text');
  const soundIconPath = document.getElementById('sound-icon-path');

  // SVG paths for sound toggle
  const SOUND_ON_PATH = "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z";
  const SOUND_OFF_PATH = "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z";

  // --- High-DPI & Responsive Dimensions ---
  let DPR = Math.max(window.devicePixelRatio || 1, 1);
  let W = window.innerWidth;
  let H = window.innerHeight;
  let groundY = H - 75;

  function resizeCanvas() {
    DPR = Math.max(window.devicePixelRatio || 1, 1);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(DPR, DPR);
    groundY = H - Math.max(65, Math.min(85, H * 0.12));
    initStars();
  }

  // --- Web Audio API Procedural Sound Engine ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = true;
      this.fuseNode = null;
      this.noiseBuffer = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.createNoiseBuffer();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    createNoiseBuffer() {
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 2;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }

    toggle() {
      this.init();
      this.muted = !this.muted;
      return !this.muted;
    }

    // Sizzling sparkler / fuse sound
    startFuseSizzle() {
      if (this.muted || !this.ctx || !this.noiseBuffer || this.fuseNode) return;
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.noiseBuffer;
        source.loop = true;

        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 3200;
        bandpass.Q.value = 3.5;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.14, this.ctx.currentTime);

        source.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(this.ctx.destination);

        source.start();
        this.fuseNode = { source, gain };
      } catch (e) {
        // audio fail graceful
      }
    }

    stopFuseSizzle() {
      if (this.fuseNode) {
        try {
          this.fuseNode.gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
          setTimeout(() => {
            try { this.fuseNode.source.stop(); } catch(e){}
            this.fuseNode = null;
          }, 120);
        } catch(e) {
          this.fuseNode = null;
        }
      }
    }

    // Rocket launch whoosh & roar
    playRocketLaunch() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 1.4);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(3000, now + 1.2);

        oscGain.gain.setValueAtTime(0.01, now);
        oscGain.gain.linearRampToValueAtTime(0.22, now + 0.3);
        oscGain.gain.linearRampToValueAtTime(0.001, now + 1.5);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.5);

        // Add whoosh noise layer
        if (this.noiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const noiseFilter = this.ctx.createBiquadFilter();
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.setValueAtTime(600, now);
          noiseFilter.frequency.exponentialRampToValueAtTime(1800, now + 1.4);

          const noiseGain = this.ctx.createGain();
          noiseGain.gain.setValueAtTime(0.05, now);
          noiseGain.gain.linearRampToValueAtTime(0.28, now + 0.6);
          noiseGain.gain.linearRampToValueAtTime(0.001, now + 1.5);

          noise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(this.ctx.destination);

          noise.start(now);
          noise.stop(now + 1.5);
        }
      } catch (e){}
    }

    // Sky explosion boom
    playExplosion(isMain = true) {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        // Sub-bass thump
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isMain ? 120 : 90, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + (isMain ? 0.6 : 0.4));

        gain.gain.setValueAtTime(isMain ? 0.6 : 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (isMain ? 1.2 : 0.8));

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.3);

        // Thunderous burst crack
        if (this.noiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(isMain ? 4500 : 3000, now);
          filter.frequency.exponentialRampToValueAtTime(180, now + 0.9);

          const nGain = this.ctx.createGain();
          nGain.gain.setValueAtTime(isMain ? 0.5 : 0.25, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + (isMain ? 1.4 : 0.9));

          noise.connect(filter);
          filter.connect(nGain);
          nGain.connect(this.ctx.destination);
          noise.start(now);
          noise.stop(now + 1.5);
        }
      } catch (e){}
    }

    // Sparkle crackles
    playCrackles() {
      if (this.muted || !this.ctx || !this.noiseBuffer) return;
      try {
        const now = this.ctx.currentTime;
        for (let i = 0; i < 4; i++) {
          const delay = i * 0.08 + Math.random() * 0.04;
          const noise = this.ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 4500 + Math.random() * 1000;

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.12, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.06);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          noise.start(now + delay);
          noise.stop(now + delay + 0.08);
        }
      } catch(e){}
    }

    // Harmonic celebratory chime for greeting reveal
    playCelebrationChime() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        // Festive Indian Raag / Pentatonic chord (D4, F#4, A4, D5, F#5)
        const notes = [293.66, 369.99, 440.00, 587.33, 739.99];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0.001, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 2.0);
        });
      } catch(e){}
    }
  }

  const sound = new SoundEngine();

  // --- Background Stars & Floating Sky Lanterns ---
  const stars = [];
  function initStars() {
    stars.length = 0;
    const count = Math.floor(Math.min(130, (W * H) / 8000));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * (groundY - 40),
        size: 0.8 + Math.random() * 1.8,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        twinkleOffset: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.4 ? 45 : 210 // warm gold & subtle blue
      });
    }
  }

  const skyLanterns = [];
  function initSkyLanterns() {
    skyLanterns.length = 0;
    for (let i = 0; i < 9; i++) {
      skyLanterns.push({
        x: Math.random() * W,
        y: Math.random() * (H * 0.55),
        scale: 0.45 + Math.random() * 0.45,
        speedY: 0.2 + Math.random() * 0.25,
        swaySpeed: 0.015 + Math.random() * 0.02,
        swayAmp: 10 + Math.random() * 15,
        seed: Math.random() * 100
      });
    }
  }

  // --- Traditional Brass Diyas on Ground Terrace ---
  const diyas = [
    { relX: 0.08, flameScale: 1.0 },
    { relX: 0.20, flameScale: 1.15 },
    { relX: 0.48, flameScale: 1.25 },
    { relX: 0.72, flameScale: 1.1 },
    { relX: 0.88, flameScale: 0.95 }
  ];

  // --- Particle Systems ---
  const particles = [];
  const sparks = [];
  const smokePuffs = [];

  class Spark {
    constructor(x, y, vx, vy, color, life, size = 2) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.maxLife = life;
      this.life = life;
      this.size = size;
      this.gravity = 0.09;
    }
    step() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.vx *= 0.98;
      this.life--;
    }
    draw(ctx) {
      const alpha = Math.max(0, this.life / this.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class SmokePuff {
    constructor(x, y, vx, vy, initialSize, life) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.size = initialSize;
      this.maxLife = life;
      this.life = life;
      this.alpha = 0.45;
    }
    step() {
      this.x += this.vx;
      this.y += this.vy;
      this.size += 0.35;
      this.life--;
    }
    draw(ctx) {
      const progress = 1 - this.life / this.maxLife;
      const currentAlpha = Math.max(0, this.alpha * (1 - progress));
      ctx.save();
      ctx.globalAlpha = currentAlpha;
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
      g.addColorStop(0, 'rgba(230, 210, 190, 0.5)');
      g.addColorStop(0.6, 'rgba(160, 140, 160, 0.25)');
      g.addColorStop(1, 'rgba(40, 20, 50, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class FireworkParticle {
    constructor(x, y, vx, vy, color, type = 'normal') {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.type = type; // 'willow', 'sparkle', 'normal', 'strobe'
      this.prevPoints = [[x, y]];
      this.maxPoints = type === 'willow' ? 8 : 4;
      this.life = type === 'willow' ? (85 + Math.random() * 45) : (50 + Math.random() * 30);
      this.maxLife = this.life;
      this.drag = type === 'willow' ? 0.965 : 0.95;
      this.gravity = type === 'willow' ? 0.055 : 0.085;
      this.size = type === 'willow' ? 2.6 : (2 + Math.random() * 2);
      this.strobeTick = 0;
    }
    step() {
      this.prevPoints.push([this.x, this.y]);
      if (this.prevPoints.length > this.maxPoints) this.prevPoints.shift();

      this.vx *= this.drag;
      this.vy *= this.drag;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.life--;

      if (this.type === 'strobe') {
        this.strobeTick++;
      }
    }
    draw(ctx) {
      if (this.life <= 0) return;
      const alpha = Math.max(0, this.life / this.maxLife);
      if (this.type === 'strobe' && Math.floor(this.strobeTick / 3) % 2 === 0) {
        return; // blinking strobe effect
      }

      ctx.save();
      // Draw tail trail
      if (this.prevPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(this.prevPoints[0][0], this.prevPoints[0][1]);
        for (let i = 1; i < this.prevPoints.length; i++) {
          ctx.lineTo(this.prevPoints[i][0], this.prevPoints[i][1]);
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size * alpha * 0.9;
        ctx.globalAlpha = alpha * 0.85;
        ctx.stroke();
      }

      // Draw particle head
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- Storyline Timeline & State ---
  let timeline = {
    time: 0,
    active: true,
    greetingRevealed: false,
    skyFlash: 0
  };

  // Coordinates
  let launchX = 0;
  let safeX = 0;
  let apexX = 0;
  let apexY = 0;

  function updateCoordinates() {
    launchX = Math.min(340, Math.max(180, W * 0.32));
    safeX = Math.min(150, Math.max(70, W * 0.14));
    apexX = W * 0.5;
    apexY = Math.max(120, H * 0.25);
  }

  // --- The Indian Man Character Rig ---
  const man = {
    x: -80,
    walkCycle: 0,
    state: 'walk_in', // 'walk_in', 'place_rocket', 'light_fuse', 'fuse_sparking', 'retreat', 'watch'
    lighterGlow: 0.8,
    crouch: 0,
    headTilt: 0,
    armAngle: 0,
    facing: 1 // 1 for right, -1 for left
  };

  // --- Firework Rocket Entity ---
  const rocket = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    launched: false,
    exploded: false,
    targetX: 0,
    targetY: 0,
    inStand: true
  };

  // Launch stand / bottle placed on ground
  function drawLaunchStand(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Cast shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brass launch vessel / decorated bottle
    const g = ctx.createLinearGradient(-10, -28, 10, 0);
    g.addColorStop(0, '#ffd700');
    g.addColorStop(0.5, '#b45309');
    g.addColorStop(1, '#78350f');

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(9, 0);
    ctx.lineTo(7, -18);
    ctx.lineTo(4, -28);
    ctx.lineTo(-4, -28);
    ctx.lineTo(-7, -18);
    ctx.closePath();
    ctx.fill();

    // Rim and decorative bands
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  // Render Realistic Indian Man in Traditional Festive Sherwani/Kurta
  function drawIndianMan(ctx, m, groundY) {
    ctx.save();
    ctx.translate(m.x, groundY);
    ctx.scale(m.facing, 1);

    const scale = Math.min(1.05, Math.max(0.75, H / 750));
    ctx.scale(scale, scale);

    // Foot ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 28, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const walk = m.walkCycle;
    const isWalking = m.state === 'walk_in' || m.state === 'retreat';
    const bob = isWalking ? Math.abs(Math.sin(walk * 2)) * 3 : 0;
    const crouchOffset = m.crouch;

    // Leg Angles
    let leftLegAngle = isWalking ? Math.sin(walk) * 0.38 : 0;
    let rightLegAngle = isWalking ? Math.sin(walk + Math.PI) * 0.38 : 0;
    if (m.crouch > 0) {
      leftLegAngle = 0.55;
      rightLegAngle = -0.35;
    }

    // --- LEGS (Cream Churidar with folds & Golden Mojaris) ---
    // Right Leg (Back)
    drawLeg(ctx, 4, -45 + bob + crouchOffset, rightLegAngle, false);

    // Left Leg (Front)
    drawLeg(ctx, -6, -45 + bob + crouchOffset, leftLegAngle, true);

    // --- TORSO & SHERWANI (Rich Royal Maroon with Golden Zari Work) ---
    ctx.save();
    ctx.translate(0, -50 + bob + crouchOffset);

    // Torso tilt when crouching to light fuse or watching
    let torsoTilt = 0;
    if (m.crouch > 0) torsoTilt = 0.28;
    if (m.state === 'watch') torsoTilt = -0.12; // leaning back to look up
    ctx.rotate(torsoTilt);

    // Royal Maroon Kurta / Sherwani Body
    const sherwaniGrad = ctx.createLinearGradient(-18, -45, 18, 45);
    sherwaniGrad.addColorStop(0, '#991b1b');
    sherwaniGrad.addColorStop(0.5, '#7f1d1d');
    sherwaniGrad.addColorStop(1, '#58111a');

    ctx.fillStyle = sherwaniGrad;
    ctx.beginPath();
    ctx.moveTo(-16, -46); // left shoulder
    ctx.lineTo(16, -46);  // right shoulder
    ctx.lineTo(19, 12);   // right waist
    ctx.lineTo(24, 42);   // right lower flare
    ctx.lineTo(-24, 42);  // left lower flare
    ctx.lineTo(-19, 12);  // left waist
    ctx.closePath();
    ctx.fill();

    // Golden Zari Hem Border
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Central Placket (Golden buttons & Zari embroidery line)
    ctx.beginPath();
    ctx.moveTo(0, -46);
    ctx.lineTo(0, 36);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Golden Buttons
    ctx.fillStyle = '#fffbeb';
    for (let b = -40; b <= 20; b += 14) {
      ctx.beginPath();
      ctx.arc(0, b, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Festive Golden Stole / Dupatta (Angavastram) draped over left shoulder
    ctx.fillStyle = 'rgba(245, 158, 11, 0.92)';
    ctx.beginPath();
    ctx.moveTo(-14, -46);
    ctx.quadraticCurveTo(-8, -10, -18, 40);
    ctx.lineTo(-12, 42);
    ctx.quadraticCurveTo(-2, -5, -8, -46);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1;
    ctx.stroke();

    // --- HEAD & NECK ---
    // Neck
    ctx.fillStyle = '#b47346';
    ctx.fillRect(-5, -54, 10, 10);

    // Mandarin Collar
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-7, -46);
    ctx.lineTo(7, -46);
    ctx.stroke();

    // Head
    ctx.save();
    ctx.translate(0, -66);
    if (m.state === 'watch') {
      ctx.rotate(-0.35); // looking up at the sky
    }

    // Face Skin
    ctx.fillStyle = '#b8734b';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10.5, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Styled Hair & Beard (Charcoal Black)
    ctx.fillStyle = '#1c1917';
    // Hair pompadour
    ctx.beginPath();
    ctx.moveTo(-11, -2);
    ctx.quadraticCurveTo(-12, -16, 0, -17);
    ctx.quadraticCurveTo(12, -15, 10, -2);
    ctx.quadraticCurveTo(5, -12, -4, -12);
    ctx.closePath();
    ctx.fill();

    // Trimmed Royal Beard & Mustache
    ctx.beginPath();
    ctx.moveTo(3, 4);
    ctx.quadraticCurveTo(9, 4, 10, 9);
    ctx.quadraticCurveTo(0, 16, -9, 9);
    ctx.quadraticCurveTo(-7, 4, 0, 4);
    ctx.closePath();
    ctx.fill();

    // Facial Features: Eye & Brow
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4, -1, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(4.8, -1, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Auspicious Diwali Chandan / Tilak
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(4, -8, 2, 4);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(5, -9.5, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Head restored

    // --- ARMS & PROPS ---
    // Left Arm (Back arm) - Holds Lit Incense Wand (Agarbatti / Lighter)
    drawLeftArm(ctx, isWalking, walk, m);

    // Right Arm (Front arm) - Holds rocket or reaches to light fuse
    drawRightArm(ctx, isWalking, walk, m);

    ctx.restore(); // Torso restored
    ctx.restore(); // Man restored
  }

  // Draw Legs with Churidar & Mojaris
  function drawLeg(ctx, hipX, hipY, angle, isFront) {
    ctx.save();
    ctx.translate(hipX, hipY);
    ctx.rotate(angle);

    // Churidar Trousers (Cream Silk with folds)
    ctx.strokeStyle = isFront ? '#fef3c7' : '#e2d5b5';
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(isFront ? 3 : -2, 24);
    ctx.lineTo(isFront ? 1 : -3, 45);
    ctx.stroke();

    // Wrinkle folds (Churis)
    ctx.strokeStyle = 'rgba(180, 150, 110, 0.4)';
    ctx.lineWidth = 1.5;
    for (let f = 26; f <= 40; f += 4) {
      ctx.beginPath();
      ctx.moveTo(-4, f);
      ctx.lineTo(4, f);
      ctx.stroke();
    }

    // Golden Mojari / Jutti Shoe
    ctx.save();
    ctx.translate(isFront ? 1 : -3, 45);
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(12, 0);
    ctx.quadraticCurveTo(17, -2, 16, -6); // upturned curled tip
    ctx.lineTo(11, -2);
    ctx.lineTo(-4, -4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // Left Arm: Holds the glowing Agarbatti / Sparkler lighter wand
  function drawLeftArm(ctx, isWalking, walk, m) {
    ctx.save();
    ctx.translate(-15, -42);

    let armAngle = isWalking ? Math.sin(walk + Math.PI) * 0.35 : 0.2;
    if (m.state === 'light_fuse' || m.state === 'fuse_sparking') {
      armAngle = 0.85; // reaching forward toward fuse
    } else if (m.state === 'watch') {
      armAngle = -0.4;
    }
    ctx.rotate(armAngle);

    // Maroon Sleeve
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(12, 22);
    ctx.stroke();

    // Golden Wrist Cuff
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Hand & Wand
    ctx.save();
    ctx.translate(12, 22);
    ctx.fillStyle = '#b47346';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Lit Incense / Agarbatti Wand
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(24, 18);
    ctx.stroke();

    // Glowing tip
    const tipX = 24;
    const tipY = 18;
    ctx.fillStyle = '#ff4500';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ffaa00';
    ctx.beginPath();
    ctx.arc(tipX, tipY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Sparks and smoke emitted from lighter tip
    if (Math.random() < 0.3) {
      sparks.push(new Spark(
        m.x + (tipX + 12) * m.facing,
        groundY - 50 + tipY,
        (Math.random() - 0.5) * 1.5,
        -Math.random() * 2,
        '#ffaa00',
        25,
        1.5
      ));
    }

    ctx.restore();
    ctx.restore();
  }

  // Right Arm: Carries the rocket, or gestures in joy
  function drawRightArm(ctx, isWalking, walk, m) {
    ctx.save();
    ctx.translate(14, -42);

    let armAngle = isWalking ? Math.sin(walk) * 0.35 : -0.2;
    if (m.state === 'place_rocket') {
      armAngle = 0.7;
    } else if (m.state === 'watch') {
      armAngle = -1.6; // pointing up at the sky in celebration!
    }
    ctx.rotate(armAngle);

    // Maroon Sleeve
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(10, 22);
    ctx.stroke();

    // Gold Kada (bracelet)
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Hand
    ctx.save();
    ctx.translate(10, 22);
    ctx.fillStyle = '#b8734b';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // If man is walking in, he carries the rocket in his hand!
    if (m.state === 'walk_in') {
      drawRocketItem(ctx, 0, -10, -0.4);
    }

    ctx.restore();
    ctx.restore();
  }

  // Draw rocket model
  function drawRocketItem(ctx, x, y, rot = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Bamboo guide stick
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 52);
    ctx.stroke();

    // Rocket Body (Festive Gold & Maroon)
    const bodyG = ctx.createLinearGradient(-7, 0, 7, 0);
    bodyG.addColorStop(0, '#ffd700');
    bodyG.addColorStop(0.5, '#dc2626');
    bodyG.addColorStop(1, '#991b1b');
    ctx.fillStyle = bodyG;
    ctx.fillRect(-6, -30, 12, 28);

    // Festive Chevron Band
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6, -18);
    ctx.lineTo(0, -14);
    ctx.lineTo(6, -18);
    ctx.stroke();

    // Pointed Nose Cone
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.moveTo(-7, -30);
    ctx.lineTo(0, -45);
    ctx.lineTo(7, -30);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Fuse cord
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.quadraticCurveTo(6, 6, 4, 14);
    ctx.stroke();

    ctx.restore();
  }

  // --- Terrace Ground & Traditional Rangoli ---
  function drawTerraceGround(ctx) {
    // Terrace Sandstone Floor
    const groundG = ctx.createLinearGradient(0, groundY, 0, H);
    groundG.addColorStop(0, '#260f1b');
    groundG.addColorStop(0.3, '#170814');
    groundG.addColorStop(1, '#09030b');
    ctx.fillStyle = groundG;
    ctx.fillRect(0, groundY, W, H - groundY);

    // Golden terrace border trim
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Subtle stone tiling lines
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 60; x < W; x += 110) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x - 30, H);
      ctx.stroke();
    }

    // Circular Rangoli Motif on Ground
    drawRangoli(ctx, W * 0.32, groundY + 28, 48);

    // Render Diyas along terrace
    diyas.forEach((diya) => {
      drawDiya(ctx, diya.relX * W, groundY + 4, diya.flameScale);
    });
  }

  // Traditional Indian Rangoli
  function drawRangoli(ctx, cx, cy, radius) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.35); // perspective squash

    // Concentric rings
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    // Petals
    const petals = 8;
    for (let i = 0; i < petals; i++) {
      const angle = (i * Math.PI * 2) / petals;
      const px = Math.cos(angle) * radius * 0.75;
      const py = Math.sin(angle) * radius * 0.75;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 215, 0, 0.35)' : 'rgba(244, 63, 94, 0.35)';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Clay / Brass Diya with animated realistic flickering flame
  function drawDiya(ctx, x, y, flameScale) {
    ctx.save();
    ctx.translate(x, y);

    // Diya Brass Base
    const bg = ctx.createLinearGradient(-14, 0, 14, 0);
    bg.addColorStop(0, '#ffd700');
    bg.addColorStop(0.5, '#b45309');
    bg.addColorStop(1, '#78350f');
    ctx.fillStyle = bg;

    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.quadraticCurveTo(0, 12, 16, 0);
    ctx.lineTo(12, -4);
    ctx.lineTo(-12, -4);
    ctx.closePath();
    ctx.fill();

    // Oil surface
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.ellipse(0, -3, 11, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flickering Flame
    const flicker = Math.sin(Date.now() * 0.015 + x) * 2;
    const fs = flameScale * (0.95 + Math.sin(Date.now() * 0.02 + x) * 0.1);

    // Outer warm radial glow
    const glow = ctx.createRadialGradient(0, -8, 2, 0, -8, 28 * fs);
    glow.addColorStop(0, 'rgba(255, 200, 50, 0.55)');
    glow.addColorStop(0.5, 'rgba(255, 120, 0, 0.2)');
    glow.addColorStop(1, 'rgba(255, 60, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -8, 28 * fs, 0, Math.PI * 2);
    ctx.fill();

    // Flame body (Teardrop)
    ctx.save();
    ctx.translate(flicker * 0.3, -6);
    ctx.scale(fs, fs);

    ctx.fillStyle = '#ff7700';
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.quadraticCurveTo(-6, -10, 0, -20);
    ctx.quadraticCurveTo(6, -10, 4, 0);
    ctx.closePath();
    ctx.fill();

    // Inner bright yellow flame
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.moveTo(-2.5, 0);
    ctx.quadraticCurveTo(-3.5, -7, 0, -14);
    ctx.quadraticCurveTo(3.5, -7, 2.5, 0);
    ctx.closePath();
    ctx.fill();

    // White hot core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-1.2, 0);
    ctx.quadraticCurveTo(-1.8, -4, 0, -8);
    ctx.quadraticCurveTo(1.8, -4, 1.2, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }

  // --- Reset Entire Celebration Sequence ---
  function resetSequence() {
    updateCoordinates();
    timeline.time = 0;
    timeline.active = true;
    timeline.greetingRevealed = false;
    timeline.skyFlash = 0;

    greetingOverlay.classList.remove('visible');

    // Reset man
    man.x = -80;
    man.walkCycle = 0;
    man.state = 'walk_in';
    man.facing = 1;
    man.crouch = 0;

    // Reset rocket
    rocket.x = launchX;
    rocket.y = groundY - 14;
    rocket.vx = 0;
    rocket.vy = 0;
    rocket.launched = false;
    rocket.exploded = false;
    rocket.targetX = apexX;
    rocket.targetY = apexY;
    rocket.inStand = true;

    // Clear particles
    particles.length = 0;
    sparks.length = 0;
    smokePuffs.length = 0;

    sound.stopFuseSizzle();
  }

  // Trigger Apex Grand Explosion
  function triggerApexExplosion(x, y) {
    timeline.skyFlash = 0.9;
    sound.playExplosion(true);

    // Multi-color palette for fireworks
    const colors = [
      '#ffd700', // Royal Gold
      '#ff4500', // Warm Orange
      '#ff1744', // Ruby Red
      '#3b82f6', // Royal Blue
      '#a855f7', // Electric Purple
      '#10b981'  // Emerald Green
    ];

    // Layer 1: Golden Willow / Kamuro Weeping Trails (120 particles)
    for (let i = 0; i < 110; i++) {
      const angle = (Math.PI * 2 * i) / 110 + (Math.random() - 0.5) * 0.15;
      const speed = 3.5 + Math.random() * 5.5;
      particles.push(new FireworkParticle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        '#ffd700',
        'willow'
      ));
    }

    // Layer 2: Colorful Chrysanthemum Burst (140 particles)
    for (let i = 0; i < 130; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 6.0;
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push(new FireworkParticle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        'normal'
      ));
    }

    // Layer 3: Crackling Strobes (35 particles)
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.2;
      particles.push(new FireworkParticle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        '#fffbeb',
        'strobe'
      ));
    }

    // Secondary crackling sound delayed slightly
    setTimeout(() => {
      sound.playCrackles();
    }, 450);

    // Layer 4: Soft illuminated smoke cloud
    for (let s = 0; s < 12; s++) {
      smokePuffs.push(new SmokePuff(
        x + (Math.random() - 0.5) * 35,
        y + (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 0.6,
        -Math.random() * 0.5,
        18 + Math.random() * 20,
        70
      ));
    }
  }

  // Ambient Ongoing Fireworks (after reveal)
  let lastAmbientFirework = 0;
  function triggerAmbientFirework() {
    const startX = W * 0.15 + Math.random() * W * 0.7;
    const burstX = startX + (Math.random() - 0.5) * 80;
    const burstY = H * 0.15 + Math.random() * H * 0.28;
    const colors = ['#ffd700', '#f43f5e', '#8b5cf6', '#06b6d4', '#f97316'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];

    sound.playExplosion(false);

    for (let i = 0; i < 65; i++) {
      const angle = (Math.PI * 2 * i) / 65;
      const speed = 2.5 + Math.random() * 4.0;
      particles.push(new FireworkParticle(
        burstX, burstY,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        chosenColor,
        Math.random() > 0.5 ? 'willow' : 'normal'
      ));
    }
  }

  // --- Main Animation Frame Loop ---
  let lastTimestamp = performance.now();

  function animate(currentTimestamp) {
    requestAnimationFrame(animate);

    const dt = Math.min(0.05, (currentTimestamp - lastTimestamp) / 1000);
    lastTimestamp = currentTimestamp;

    // Advance timeline
    timeline.time += dt;
    const t = timeline.time;

    // Clear Canvas
    ctx.clearRect(0, 0, W, H);

    // Sky Flash illumination
    if (timeline.skyFlash > 0) {
      ctx.fillStyle = `rgba(255, 230, 180, ${timeline.skyFlash * 0.45})`;
      ctx.fillRect(0, 0, W, H);
      timeline.skyFlash = Math.max(0, timeline.skyFlash - dt * 2.5);
    }

    // 1. Draw Twinkling Background Stars
    ctx.save();
    stars.forEach((star) => {
      const twinkle = Math.sin(currentTimestamp * star.twinkleSpeed * 0.05 + star.twinkleOffset);
      const alpha = 0.45 + twinkle * 0.35;
      ctx.fillStyle = star.hue === 45 ? `rgba(255, 235, 170, ${alpha})` : `rgba(200, 220, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 2. Draw Floating Sky Lanterns (Kandils)
    ctx.save();
    skyLanterns.forEach((lantern) => {
      lantern.y -= lantern.speedY;
      if (lantern.y < -40) {
        lantern.y = H * 0.6;
        lantern.x = Math.random() * W;
      }
      const sway = Math.sin(currentTimestamp * 0.001 * lantern.swaySpeed * 60 + lantern.seed) * lantern.swayAmp;
      const lx = lantern.x + sway;
      const ly = lantern.y;

      ctx.save();
      ctx.translate(lx, ly);
      ctx.scale(lantern.scale, lantern.scale);

      // Lantern Glow
      const lg = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
      lg.addColorStop(0, 'rgba(255, 190, 80, 0.7)');
      lg.addColorStop(0.5, 'rgba(255, 100, 0, 0.25)');
      lg.addColorStop(1, 'rgba(255, 50, 0, 0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();

      // Lantern body (Festive warm box)
      ctx.fillStyle = '#ff9100';
      ctx.fillRect(-8, -12, 16, 22);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-8, -12, 16, 22);

      // Inner flame
      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.arc(0, 3, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
    ctx.restore();

    // 3. Draw Ground Terrace, Rangoli & Diyas
    drawTerraceGround(ctx);

    // 4. Draw Launch Stand on Ground
    drawLaunchStand(ctx, launchX, groundY + 6);

    // -------------------------------------------------------------
    // STORYLINE STATE MACHINE
    // -------------------------------------------------------------
    // Phase 1: Man walks in (0s to 3.4s)
    if (t < 3.4) {
      man.state = 'walk_in';
      man.facing = 1;
      const walkProgress = t / 3.4;
      man.x = -80 + (launchX - 65 - (-80)) * walkProgress;
      man.walkCycle += dt * 9;
      man.crouch = 0;
    }
    // Phase 2: Man reaches launch stand and sets rocket into bottle (3.4s to 4.6s)
    else if (t < 4.6) {
      man.state = 'place_rocket';
      man.facing = 1;
      man.x = launchX - 65;
      man.crouch = Math.sin(((t - 3.4) / 1.2) * Math.PI) * 14;
    }
    // Phase 3: Man extends lighter wand to light fuse (4.6s to 5.8s)
    else if (t < 5.8) {
      man.state = 'light_fuse';
      man.facing = 1;
      man.x = launchX - 65;
      man.crouch = 22; // bending down gracefully
    }
    // Phase 4: Fuse touches lighter & Sizzles with bright sparks & smoke (5.8s to 7.4s)
    else if (t < 7.4) {
      man.state = 'fuse_sparking';
      man.facing = 1;
      man.x = launchX - 65;
      man.crouch = 20;

      if (t === 5.8 || !sound.fuseNode) {
        sound.startFuseSizzle();
      }

      // Spray fuse sparks
      const fuseX = launchX + 4;
      const fuseY = groundY - 8;
      for (let sp = 0; sp < 3; sp++) {
        sparks.push(new Spark(
          fuseX, fuseY,
          (Math.random() - 0.4) * 3.5,
          -Math.random() * 3.5 - 1.0,
          Math.random() > 0.3 ? '#ffd700' : '#ffffff',
          22 + Math.random() * 15,
          2.2
        ));
      }

      // Fuse smoke puff
      if (Math.random() < 0.4) {
        smokePuffs.push(new SmokePuff(
          fuseX, fuseY,
          (Math.random() - 0.5) * 0.8,
          -Math.random() * 1.2,
          7,
          45
        ));
      }
    }
    // Phase 5: Man steps back safely to safeX (7.4s to 8.8s)
    else if (t < 8.8) {
      sound.stopFuseSizzle();
      man.state = 'retreat';
      man.facing = -1; // facing backwards
      const retreatProgress = (t - 7.4) / 1.4;
      man.x = (launchX - 65) - ((launchX - 65) - safeX) * retreatProgress;
      man.walkCycle += dt * 8;
      man.crouch = 0;
    }
    // Phase 6 & beyond: Man stands at safe distance watching sky in celebration (8.8s+)
    else {
      sound.stopFuseSizzle();
      man.state = 'watch';
      man.facing = 1; // facing launch & sky
      man.x = safeX;
      man.crouch = 0;
    }

    // Rocket Launch Logic (at t = 8.8s)
    if (t >= 8.8 && !rocket.launched) {
      rocket.launched = true;
      rocket.inStand = false;
      rocket.x = launchX;
      rocket.y = groundY - 14;
      rocket.vx = (apexX - launchX) / 1.4; // reach apexX
      rocket.vy = -12; // strong upward velocity
      sound.playRocketLaunch();

      // Launch thrust flash & smoke burst
      timeline.skyFlash = 0.5;
      for (let i = 0; i < 20; i++) {
        smokePuffs.push(new SmokePuff(
          launchX + (Math.random() - 0.5) * 20,
          groundY - 10,
          (Math.random() - 0.5) * 2,
          -Math.random() * 1.5,
          12,
          50
        ));
      }
    }

    // Rocket Flight & Particle Trail
    if (rocket.launched && !rocket.exploded) {
      rocket.x += rocket.vx * dt;
      rocket.y += rocket.vy;
      rocket.vy *= 0.985; // smooth decelerating curve towards apex

      // Emit intense golden particle trail
      for (let p = 0; p < 7; p++) {
        particles.push(new FireworkParticle(
          rocket.x + (Math.random() - 0.5) * 4,
          rocket.y + 16,
          (Math.random() - 0.5) * 1.5,
          Math.random() * 2 + 1.0,
          Math.random() > 0.3 ? '#ffd700' : '#ff9100',
          'willow'
        ));
      }

      // Exhaust smoke trail
      if (Math.random() < 0.6) {
        smokePuffs.push(new SmokePuff(
          rocket.x,
          rocket.y + 20,
          (Math.random() - 0.5) * 0.5,
          Math.random() * 0.8,
          8,
          35
        ));
      }

      // Apex detonation check
      if (rocket.y <= apexY || t >= 10.3) {
        rocket.exploded = true;
        triggerApexExplosion(rocket.x, rocket.y);
      } else {
        // Draw soaring rocket
        drawRocketItem(ctx, rocket.x, rocket.y, -0.15);
      }
    }

    // If rocket is sitting in stand before launch
    if (!rocket.launched && t >= 3.4) {
      drawRocketItem(ctx, launchX, groundY - 14, 0);
    }

    // Draw the Indian Man Character
    drawIndianMan(ctx, man, groundY);

    // 5. Update & Draw Smoke Puffs
    for (let i = smokePuffs.length - 1; i >= 0; i--) {
      smokePuffs[i].step();
      smokePuffs[i].draw(ctx);
      if (smokePuffs[i].life <= 0) smokePuffs.splice(i, 1);
    }

    // 6. Update & Draw Sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      sparks[i].step();
      sparks[i].draw(ctx);
      if (sparks[i].life <= 0) sparks.splice(i, 1);
    }

    // 7. Update & Draw Firework Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].step();
      particles[i].draw(ctx);
      if (particles[i].life <= 0) particles.splice(i, 1);
    }

    // 8. Diwali Greeting Reveal Trigger (at t = 10.6s)
    if (t >= 10.6 && !timeline.greetingRevealed) {
      timeline.greetingRevealed = true;
      greetingOverlay.classList.add('visible');
      sound.playCelebrationChime();
    }

    // 9. Ambient Ongoing Fireworks after reveal
    if (timeline.greetingRevealed && t - lastAmbientFirework > 3.2) {
      lastAmbientFirework = t;
      triggerAmbientFirework();
    }
  }

  // --- Event Listeners & Controls ---
  window.addEventListener('resize', () => {
    resizeCanvas();
    updateCoordinates();
  }, { passive: true });

  btnReplay.addEventListener('click', () => {
    resetSequence();
  });

  btnCardReplay.addEventListener('click', () => {
    resetSequence();
  });

  btnSound.addEventListener('click', () => {
    const isUnmuted = sound.toggle();
    if (isUnmuted) {
      soundText.textContent = 'Sound: ON';
      soundIconPath.setAttribute('d', SOUND_ON_PATH);
      btnSound.style.borderColor = '#10b981';
      btnSound.style.color = '#10b981';
    } else {
      soundText.textContent = 'Sound: OFF';
      soundIconPath.setAttribute('d', SOUND_OFF_PATH);
      btnSound.style.borderColor = 'rgba(255, 215, 0, 0.5)';
      btnSound.style.color = '#ffd700';
    }
  });

  // Keyboard accessibility: 'R' to replay, 'M' to toggle sound, Space to replay
  window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R' || e.key === ' ') {
      resetSequence();
    } else if (e.key === 'm' || e.key === 'M') {
      btnSound.click();
    }
  });

  // Initialization
  resizeCanvas();
  initStars();
  initSkyLanterns();
  resetSequence();

  // Kick off animation loop
  requestAnimationFrame(animate);

})();
