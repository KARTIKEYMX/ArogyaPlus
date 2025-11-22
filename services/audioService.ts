class AudioService {
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private oscillator: AudioBufferSourceNode | null = null;
  public isPlaying = false;

  private initContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Generate Pink/Brown noise for medical relaxation (Zen Mode)
  private createNoiseBuffer() {
    if (!this.audioCtx) return null;
    const bufferSize = this.audioCtx.sampleRate * 2; // 2 seconds buffer
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    
    // Brown noise generator (softer, deeper than white noise)
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate for gain
    }
    return buffer;
  }

  public toggleZenMode() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  public play() {
    this.initContext();
    if (!this.audioCtx) return;

    // Create noise
    const buffer = this.createNoiseBuffer();
    if (!buffer) return;

    this.oscillator = this.audioCtx.createBufferSource();
    this.oscillator.buffer = buffer;
    this.oscillator.loop = true;

    // Filter to make it warmer
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Warm, womb-like sound

    this.gainNode = this.audioCtx.createGain();
    // Fade in
    this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0.15, this.audioCtx.currentTime + 2);

    this.oscillator.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);

    this.oscillator.start();
    this.isPlaying = true;
  }

  public stop() {
    if (this.gainNode && this.audioCtx) {
      // Fade out
      this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1);
      setTimeout(() => {
        if (this.oscillator) {
          this.oscillator.stop();
          this.oscillator = null;
        }
      }, 1000);
    } else {
      if (this.oscillator) this.oscillator.stop();
    }
    this.isPlaying = false;
  }

  public triggerHaptic(pattern: number | number[] = 10) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
}

export const audioService = new AudioService();