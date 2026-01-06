import { useState, useCallback, useRef, useEffect } from 'react';

export type SoundType = 'notification' | 'success' | 'error' | 'warning' | 'message';

const DEFAULT_SOUNDS: Record<SoundType, string> = {
  notification: '/sounds/notification.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  warning: '/sounds/warning.mp3',
  message: '/sounds/message.mp3',
};

export interface UseSoundAlertsOptions {
  sounds?: Partial<Record<SoundType, string>>;
  defaultVolume?: number;
  storageKey?: string;
}

export function useSoundAlerts(options: UseSoundAlertsOptions = {}) {
  const { sounds: customSounds = {}, defaultVolume = 0.5, storageKey = 'sound-alerts' } = options;
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(storageKey) !== 'disabled';
  });
  const [volume, setVolume] = useState(defaultVolume);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const sounds = { ...DEFAULT_SOUNDS, ...customSounds };

  useEffect(() => {
    localStorage.setItem(storageKey, isEnabled ? 'enabled' : 'disabled');
  }, [isEnabled, storageKey]);

  const getAudio = useCallback((type: SoundType): HTMLAudioElement => {
    if (!audioRefs.current[type]) {
      const audio = new Audio(sounds[type]);
      audio.volume = volume;
      audioRefs.current[type] = audio;
    }
    return audioRefs.current[type];
  }, [sounds, volume]);

  const play = useCallback((type: SoundType) => {
    if (!isEnabled) return;
    const audio = getAudio(type);
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(() => {});
  }, [isEnabled, getAudio, volume]);

  const updateVolume = useCallback((newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolume(clamped);
    Object.values(audioRefs.current).forEach(audio => { audio.volume = clamped; });
  }, []);

  const toggle = useCallback(() => setIsEnabled(prev => !prev), []);

  return { isEnabled, volume, play, toggle, setEnabled: setIsEnabled, setVolume: updateVolume };
}

export default useSoundAlerts;
