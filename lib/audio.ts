'use client';

// Audio context for web audio API sounds
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// Synthesized sounds using Web Audio API
export function playCorrectSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    oscillator.type = 'sine';
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch {
    // Silently fail if audio not supported
  }
}

export function playWrongSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(220, ctx.currentTime); // A3
    oscillator.frequency.setValueAtTime(196, ctx.currentTime + 0.1); // G3

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.01, ctx.currentTime + 0.25);

    oscillator.type = 'triangle';
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.25);
  } catch {
    // Silently fail
  }
}

export function playStreakSound(streakLevel: number) {
  try {
    const ctx = getAudioContext();

    // Play ascending notes based on streak
    const baseFreq = 440 + (streakLevel * 50);
    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gainNode.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.08);
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.15);

      oscillator.type = 'sine';
      oscillator.start(ctx.currentTime + i * 0.08);
      oscillator.stop(ctx.currentTime + i * 0.08 + 0.15);
    });
  } catch {
    // Silently fail
  }
}

export function playLevelCompleteSound() {
  try {
    const ctx = getAudioContext();

    // Victory fanfare: C-E-G-C (octave)
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);

      oscillator.type = 'sine';
      oscillator.start(ctx.currentTime + i * 0.15);
      oscillator.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  } catch {
    // Silently fail
  }
}

export function playBossDamageSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.setValueAtTime(100, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.type = 'sawtooth';
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch {
    // Silently fail
  }
}

export function playBossVictorySound() {
  try {
    const ctx = getAudioContext();

    // Epic victory fanfare
    const notes = [392, 523.25, 659.25, 783.99, 1046.5, 1318.51];

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gainNode.gain.setValueAtTime(0.35, ctx.currentTime + i * 0.12);
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.4);

      oscillator.type = i > 3 ? 'triangle' : 'sine';
      oscillator.start(ctx.currentTime + i * 0.12);
      oscillator.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch {
    // Silently fail
  }
}

export function playBossDefeatSound() {
  try {
    const ctx = getAudioContext();

    // Sad descending tones
    const notes = [392, 349.23, 311.13, 261.63];

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.25);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.25);
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime + i * 0.25 + 0.3);

      oscillator.type = 'triangle';
      oscillator.start(ctx.currentTime + i * 0.25);
      oscillator.stop(ctx.currentTime + i * 0.25 + 0.3);
    });
  } catch {
    // Silently fail
  }
}

export function playButtonClick() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.type = 'sine';
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  } catch {
    // Silently fail
  }
}

export function playAchievementSound() {
  try {
    const ctx = getAudioContext();

    // Magical sparkle sound
    const notes = [783.99, 987.77, 1174.66, 1567.98];

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.2);

      oscillator.type = 'sine';
      oscillator.start(ctx.currentTime + i * 0.08);
      oscillator.stop(ctx.currentTime + i * 0.08 + 0.2);
    });
  } catch {
    // Silently fail
  }
}

// Mastery celebration - "Grokking" sound (Theory of Fun)
// A special triumphant sound when a card reaches mastered status
export function playMasterySound() {
  try {
    const ctx = getAudioContext();

    // Triumphant ascending arpeggio with golden shimmer
    // C major to high C with sparkle overtones
    const notes = [
      { freq: 523.25, delay: 0, type: 'sine' as OscillatorType },      // C5
      { freq: 659.25, delay: 0.1, type: 'sine' as OscillatorType },    // E5
      { freq: 783.99, delay: 0.2, type: 'sine' as OscillatorType },    // G5
      { freq: 1046.5, delay: 0.3, type: 'triangle' as OscillatorType }, // C6
      { freq: 1318.51, delay: 0.45, type: 'sine' as OscillatorType },  // E6 (shimmer)
      { freq: 1567.98, delay: 0.5, type: 'sine' as OscillatorType },   // G6 (shimmer)
    ];

    notes.forEach(({ freq, delay, type }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      // Main notes louder, shimmer notes quieter
      const volume = delay >= 0.45 ? 0.15 : 0.3;
      gainNode.gain.setValueAtTime(volume, ctx.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.5);

      oscillator.type = type;
      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + 0.5);
    });

    // Add a subtle low bass note for gravitas
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
    bassGain.gain.setValueAtTime(0.15, ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    bassOsc.type = 'sine';
    bassOsc.start(ctx.currentTime);
    bassOsc.stop(ctx.currentTime + 0.8);
  } catch {
    // Silently fail
  }
}
