// Web Audio API Generative Romantic Ambient Synthesizer

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalId: number | null = null;
  private masterGain: GainNode | null = null;
  private chordIndex: number = 0;

  // Romantic chord voicings (frequencies in Hz)
  // Cmaj9 -> Fmaj7 -> Am9 -> Gadd9
  private chords = [
    [130.81, 196.00, 246.94, 293.66, 329.63], // C3, G3, B3, D4, E4
    [174.61, 220.00, 261.63, 329.63, 392.00], // F3, A3, C4, E4, G4
    [110.00, 164.81, 220.00, 261.63, 329.63], // A2, E3, A3, C4, E4
    [98.00, 146.83, 196.00, 246.94, 293.66],  // G2, D3, G3, B3, D4
  ];

  // Pentatonic melody notes for gentle random twinkling
  private melodyNotes = [
    329.63, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 783.99
  ];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output with gentle low-pass warmth
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.0, this.ctx.currentTime);

      this.masterGain.connect(filter);
      filter.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a soft rhodes / music-box note
  private playNote(freq: number, startTime: number, duration: number = 3.5, velocity: number = 0.08) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    // Warm sine + soft triangle for music-box / rhodes hybrid timbre
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime); // subtle 2nd harmonic

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(velocity * 0.25, startTime);
    osc2.connect(subGain);
    subGain.connect(noteGain);

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    // Natural piano-like attack & long dreamy decay
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(velocity, startTime + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(velocity * 0.4, startTime + 0.8);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.start(startTime);
    osc2.start(startTime);
    osc.stop(startTime + duration + 0.1);
    osc2.stop(startTime + duration + 0.1);
  }

  private stepChord() {
    if (!this.ctx || !this.isPlaying) return;

    const chord = this.chords[this.chordIndex % this.chords.length];
    const now = this.ctx.currentTime;

    // Arpeggiate chord notes with natural gentle delay
    chord.forEach((freq, idx) => {
      const delay = idx * 0.12 + Math.random() * 0.04;
      this.playNote(freq, now + delay, 4.2, 0.06);
    });

    // Random gentle high twinkle note
    if (Math.random() > 0.3) {
      const randomNote = this.melodyNotes[Math.floor(Math.random() * this.melodyNotes.length)];
      this.playNote(randomNote, now + 0.8 + Math.random() * 1.5, 3.0, 0.04);
    }

    this.chordIndex++;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = true;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.7, now + 1.5);

    // Initial chord immediately
    this.stepChord();

    // Cycle chords every 3.8 seconds
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = window.setInterval(() => {
      this.stepChord();
    }, 3800);
  }

  public stop() {
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.0);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Playful dodge sound effect when NO runs away
  public playDodgeSwoosh() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(520 + Math.random() * 100, now + 0.16);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Soft sparkle when hovering YES
  public playSparkle() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [659.25, 783.99, 987.77].forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.06);

        gain.gain.setValueAtTime(0.001, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.03, now + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.4);
      });
    } catch {
      // AudioContext policy fallback
    }
  }

  // Joyful harp glissando when YES is clicked
  public playCelebration() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const harpNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

      harpNotes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.001, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 1.0);
      });
    } catch {
      // AudioContext policy fallback
    }
  }

  // Gentle cute duck quack sound effect
  public playQuack() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [0, 0.12].forEach((offset) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now + offset);
        osc.frequency.exponentialRampToValueAtTime(260, now + offset + 0.08);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(750, now + offset);
        filter.Q.setValueAtTime(3.5, now + offset);

        gain.gain.setValueAtTime(0.001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.05, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.09);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.1);
      });
    } catch {
      // AudioContext policy fallback
    }
  }
}

export const romanticAudio = new RomanticAudioEngine();
