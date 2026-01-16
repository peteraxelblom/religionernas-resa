'use client';

// Audio context for web audio API sounds
let audioContext: AudioContext | null = null;

// Boss battle music state - tracking oscillators for cleanup
let bossMusicPlaying = false;
let bossMusicOscillators: OscillatorNode[] = [];
let bossMusicGains: GainNode[] = [];
let bossMusicIntervalId: ReturnType<typeof setInterval> | null = null;

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

// Mystery box shake/open sound - building anticipation
export function playMysteryBoxOpen() {
  try {
    const ctx = getAudioContext();

    // Rising pitch sequence building excitement
    const notes = [
      { freq: 300, delay: 0, duration: 0.15 },
      { freq: 350, delay: 0.12, duration: 0.15 },
      { freq: 400, delay: 0.24, duration: 0.15 },
      { freq: 500, delay: 0.36, duration: 0.15 },
      { freq: 600, delay: 0.48, duration: 0.15 },
      { freq: 800, delay: 0.6, duration: 0.2 },
      { freq: 1000, delay: 0.75, duration: 0.25 },
    ];

    notes.forEach(({ freq, delay, duration }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);

      oscillator.type = 'sine';
      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + duration);
    });

    // Add sparkle at the end
    setTimeout(() => {
      const sparkleNotes = [1200, 1400, 1600];
      sparkleNotes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.15);
        osc.type = 'sine';
        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + i * 0.05 + 0.15);
      });
    }, 900);
  } catch {
    // Silently fail
  }
}

// Reward reveal sound - coin drop + mini fanfare
export function playRewardReveal() {
  try {
    const ctx = getAudioContext();

    // Coin drop sounds (metallic pings)
    const coinNotes = [
      { freq: 2000, delay: 0 },
      { freq: 2200, delay: 0.08 },
      { freq: 2400, delay: 0.16 },
    ];

    coinNotes.forEach(({ freq, delay }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.1);

      oscillator.type = 'triangle';
      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + 0.1);
    });

    // Mini fanfare after coin sounds
    const fanfareNotes = [659.25, 783.99, 987.77, 1046.5];
    fanfareNotes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + 0.3 + i * 0.1);
      gainNode.gain.setValueAtTime(0.25, ctx.currentTime + 0.3 + i * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3 + i * 0.1 + 0.25);

      oscillator.type = 'sine';
      oscillator.start(ctx.currentTime + 0.3 + i * 0.1);
      oscillator.stop(ctx.currentTime + 0.3 + i * 0.1 + 0.25);
    });
  } catch {
    // Silently fail
  }
}

// Whoosh transition sound
export function playWhoosh() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // White noise-like effect with sweeping filter
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(100, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.15);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    // Silently fail
  }
}

// Boss intro sound - dramatic tension builder for battle start
export function playBossIntroSound() {
  try {
    const ctx = getAudioContext();

    // Tension-building low drone
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    droneOsc.connect(droneGain);
    droneGain.connect(ctx.destination);
    droneOsc.frequency.setValueAtTime(65.41, ctx.currentTime); // C2
    droneOsc.frequency.linearRampToValueAtTime(73.42, ctx.currentTime + 2); // Rising to D2
    droneGain.gain.setValueAtTime(0, ctx.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.5);
    droneGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.5);
    droneGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.5);
    droneOsc.type = 'sawtooth';
    droneOsc.start(ctx.currentTime);
    droneOsc.stop(ctx.currentTime + 2.5);

    // Rising tension notes
    const tensionNotes = [
      { freq: 130.81, delay: 0.5 }, // C3
      { freq: 155.56, delay: 1.0 }, // Eb3
      { freq: 196, delay: 1.5 },    // G3
    ];

    tensionNotes.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.5);
      osc.type = 'triangle';
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.5);
    });

    // Dramatic impact at the end
    setTimeout(() => {
      const impactOsc = ctx.createOscillator();
      const impactGain = ctx.createGain();
      impactOsc.connect(impactGain);
      impactGain.connect(ctx.destination);
      impactOsc.frequency.setValueAtTime(98, ctx.currentTime);
      impactOsc.frequency.exponentialRampToValueAtTime(49, ctx.currentTime + 0.3);
      impactGain.gain.setValueAtTime(0.3, ctx.currentTime);
      impactGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      impactOsc.type = 'sawtooth';
      impactOsc.start(ctx.currentTime);
      impactOsc.stop(ctx.currentTime + 0.5);
    }, 2000);
  } catch {
    // Silently fail
  }
}

// Boss unlock sound - dramatic ominous reveal
export function playBossUnlockSound() {
  try {
    const ctx = getAudioContext();

    // Deep dramatic intro (ominous rumble)
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.frequency.setValueAtTime(55, ctx.currentTime); // Very low A1
    bassOsc.frequency.exponentialRampToValueAtTime(82.41, ctx.currentTime + 0.3); // Rising to E2
    bassGain.gain.setValueAtTime(0.3, ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    bassOsc.type = 'sawtooth';
    bassOsc.start(ctx.currentTime);
    bassOsc.stop(ctx.currentTime + 0.8);

    // Dramatic reveal notes (boss appears!)
    const revealNotes = [
      { freq: 196, delay: 0.3, duration: 0.25 }, // G3
      { freq: 233.08, delay: 0.5, duration: 0.25 }, // Bb3
      { freq: 293.66, delay: 0.7, duration: 0.4 }, // D4
    ];

    revealNotes.forEach(({ freq, delay, duration }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gainNode.gain.setValueAtTime(0.25, ctx.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);

      oscillator.type = 'triangle';
      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + duration);
    });

    // Final impact chord (boss fully revealed)
    setTimeout(() => {
      const chordNotes = [146.83, 220, 293.66, 440]; // D3, A3, D4, A4 (D minor power chord)
      chordNotes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.type = 'sawtooth';
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);
      });
    }, 1000);
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

// Boss battle background music - low tension drone that loops
// Creates atmosphere without being distracting
export function playBossBattleMusic() {
  if (bossMusicPlaying) return; // Already playing

  try {
    const ctx = getAudioContext();
    bossMusicPlaying = true;
    bossMusicOscillators = [];
    bossMusicGains = [];

    // Create persistent low drone
    const droneFrequencies = [65.41, 98, 130.81]; // C2, G2, C3 - ominous fifth chord

    droneFrequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.type = i === 0 ? 'sawtooth' : 'triangle';

      // Layered volumes - bass louder, higher notes softer
      const volume = i === 0 ? 0.08 : 0.04;
      gain.gain.setValueAtTime(volume, ctx.currentTime);

      osc.start(ctx.currentTime);

      bossMusicOscillators.push(osc);
      bossMusicGains.push(gain);
    });

    // Add subtle pulsing LFO for tension
    const lfoOsc = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const mainGain = bossMusicGains[0];

    lfoOsc.frequency.setValueAtTime(0.5, ctx.currentTime); // Slow pulse
    lfoOsc.type = 'sine';
    lfoGain.gain.setValueAtTime(0.02, ctx.currentTime); // Subtle modulation

    lfoOsc.connect(lfoGain);
    lfoGain.connect(mainGain.gain);

    lfoOsc.start(ctx.currentTime);
    bossMusicOscillators.push(lfoOsc);
    bossMusicGains.push(lfoGain);

    // Add periodic tension hits (every 4 seconds)
    bossMusicIntervalId = setInterval(() => {
      if (!bossMusicPlaying) return;

      try {
        const hitOsc = ctx.createOscillator();
        const hitGain = ctx.createGain();

        hitOsc.connect(hitGain);
        hitGain.connect(ctx.destination);

        hitOsc.frequency.setValueAtTime(55, ctx.currentTime);
        hitOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);
        hitOsc.type = 'sawtooth';

        hitGain.gain.setValueAtTime(0.1, ctx.currentTime);
        hitGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

        hitOsc.start(ctx.currentTime);
        hitOsc.stop(ctx.currentTime + 0.8);
      } catch {
        // Ignore errors in interval
      }
    }, 4000);
  } catch {
    // Silently fail
    bossMusicPlaying = false;
  }
}

// Stop boss battle music - cleanup all oscillators
export function stopBossBattleMusic() {
  if (!bossMusicPlaying) return;

  try {
    const ctx = getAudioContext();

    // Fade out gracefully
    bossMusicGains.forEach((gain) => {
      try {
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      } catch {
        // Ignore errors
      }
    });

    // Stop oscillators after fade
    setTimeout(() => {
      bossMusicOscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          // Ignore - may already be stopped
        }
      });
      bossMusicOscillators = [];
      bossMusicGains = [];
    }, 600);

    // Clear interval
    if (bossMusicIntervalId) {
      clearInterval(bossMusicIntervalId);
      bossMusicIntervalId = null;
    }

    bossMusicPlaying = false;
  } catch {
    // Silently fail
    bossMusicPlaying = false;
    bossMusicOscillators = [];
    bossMusicGains = [];
    if (bossMusicIntervalId) {
      clearInterval(bossMusicIntervalId);
      bossMusicIntervalId = null;
    }
  }
}
