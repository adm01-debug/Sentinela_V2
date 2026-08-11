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
  enabled?: boolean;
}

export function useSoundAlerts(options: UseSoundAlertsOptions = {}) {
  const { sounds = {}, defaultVolume = 0.5, enabled: initialEnabled = true } = options;
  const [enabled, setEnabled] = useState(initialEnabled);
  const [volume, setVolume] = useState(defaultVolume);
  const audioRefs = useRef<Map<SoundType, HTMLAudioElement>>(new Map());

  const allSounds = { ...DEFAULT_SOUNDS, ...sounds };

  useEffect(() => {
    Object.entries(allSounds).forEach(([type, src]) => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = volume;
      audioRefs.current.set(type as SoundType, audio);
    });
    return () => { audioRefs.current.forEach(audio => { audio.pause(); audio.src = ''; }); audioRefs.current.clear(); };
  }, []);

  useEffect(() => {
    audioRefs.current.forEach(audio => { audio.volume = volume; });
  }, [volume]);

  const play = useCallback((type: SoundType) => {
    if (!enabled) return;
    const audio = audioRefs.current.get(type);
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
  }, [enabled]);

  const stop = useCallback((type: SoundType) => {
    const audio = audioRefs.current.get(type);
    if (audio) { audio.pause(); audio.currentTime = 0; }
  }, []);

  const stopAll = useCallback(() => { audioRefs.current.forEach(audio => { audio.pause(); audio.currentTime = 0; }); }, []);

  const toggle = useCallback(() => setEnabled(prev => !prev), []);

  return { enabled, volume, setEnabled, setVolume, toggle, play, stop, stopAll };
}

export default useSoundAlerts;
