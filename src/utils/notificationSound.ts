// Notification sound utility with multiple sound types
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

export type SoundType = 'chime' | 'alert' | 'alarm' | 'bell' | 'none';

const soundConfigs: Record<Exclude<SoundType, 'none'>, {
  frequencies: number[];
  durations: number[];
  type: OscillatorType;
  volume: number;
}> = {
  chime: {
    frequencies: [880, 1108.73],
    durations: [0.1, 0.2],
    type: 'sine',
    volume: 0.3,
  },
  alert: {
    frequencies: [523.25, 659.25, 783.99],
    durations: [0.08, 0.08, 0.15],
    type: 'square',
    volume: 0.2,
  },
  alarm: {
    frequencies: [440, 880, 440, 880],
    durations: [0.15, 0.15, 0.15, 0.3],
    type: 'sawtooth',
    volume: 0.25,
  },
  bell: {
    frequencies: [987.77, 1174.66],
    durations: [0.2, 0.4],
    type: 'sine',
    volume: 0.35,
  },
};

export const playNotificationSound = (soundType: SoundType = 'chime', volumeMultiplier: number = 1) => {
  if (soundType === 'none') return;

  try {
    const ctx = getAudioContext();
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const config = soundConfigs[soundType];
    const now = ctx.currentTime;
    let currentTime = now;

    config.frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(freq, currentTime);
      
      const duration = config.durations[index];
      const volume = config.volume * volumeMultiplier;
      
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration);
      
      currentTime += duration;
    });
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

export const playSoundBySeverity = (
  severity: 'medium' | 'high' | 'critical',
  settings: {
    enabled: boolean;
    soundType: SoundType;
    volume: number;
    playCritical: boolean;
    playHigh: boolean;
    playMedium: boolean;
  }
) => {
  if (!settings.enabled) return;

  const shouldPlay = 
    (severity === 'critical' && settings.playCritical) ||
    (severity === 'high' && settings.playHigh) ||
    (severity === 'medium' && settings.playMedium);

  if (shouldPlay) {
    // Use more urgent sound for critical alerts
    const soundType = severity === 'critical' ? 'alarm' : settings.soundType;
    playNotificationSound(soundType, settings.volume / 100);
  }
};

export const testSound = (soundType: SoundType, volume: number) => {
  playNotificationSound(soundType, volume / 100);
};
