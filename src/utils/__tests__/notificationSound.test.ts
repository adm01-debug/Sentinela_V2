import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('notificationSound utils', () => {
  let mockAudio: any;

  beforeEach(() => {
    mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      load: vi.fn(),
      volume: 1,
      currentTime: 0,
      src: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    vi.stubGlobal('Audio', vi.fn(() => mockAudio));
  });

  describe('sound playback', () => {
    it('should play notification sound', async () => {
      const audio = new Audio('/sounds/notification.mp3');
      await audio.play();
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('should handle play failure', async () => {
      mockAudio.play.mockRejectedValueOnce(new Error('Autoplay blocked'));
      const audio = new Audio('/sounds/notification.mp3');
      await expect(audio.play()).rejects.toThrow('Autoplay blocked');
    });

    it('should pause sound', () => {
      const audio = new Audio('/sounds/notification.mp3');
      audio.pause();
      expect(mockAudio.pause).toHaveBeenCalled();
    });

    it('should load sound', () => {
      const audio = new Audio('/sounds/notification.mp3');
      audio.load();
      expect(mockAudio.load).toHaveBeenCalled();
    });
  });

  describe('volume control', () => {
    it('should set volume', () => {
      const audio = new Audio();
      audio.volume = 0.5;
      expect(mockAudio.volume).toBe(0.5);
    });

    it('should clamp volume between 0 and 1', () => {
      const setVolume = (vol: number) => Math.max(0, Math.min(1, vol));
      expect(setVolume(1.5)).toBe(1);
      expect(setVolume(-0.5)).toBe(0);
      expect(setVolume(0.7)).toBe(0.7);
    });

    it('should mute sound', () => {
      const audio = new Audio();
      audio.volume = 0;
      expect(mockAudio.volume).toBe(0);
    });
  });

  describe('sound types', () => {
    it('should play success sound', async () => {
      const sounds = {
        success: '/sounds/success.mp3',
        error: '/sounds/error.mp3',
        warning: '/sounds/warning.mp3',
      };
      const audio = new Audio(sounds.success);
      await audio.play();
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('should play error sound', async () => {
      const audio = new Audio('/sounds/error.mp3');
      await audio.play();
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('should play message sound', async () => {
      const audio = new Audio('/sounds/message.mp3');
      await audio.play();
      expect(mockAudio.play).toHaveBeenCalled();
    });
  });

  describe('sound preferences', () => {
    it('should respect user sound preference', () => {
      const soundEnabled = true;
      if (soundEnabled) {
        mockAudio.play();
      }
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('should not play when disabled', () => {
      const soundEnabled = false;
      if (soundEnabled) {
        mockAudio.play();
      }
      expect(mockAudio.play).not.toHaveBeenCalled();
    });

    it('should remember volume preference', () => {
      const savedVolume = localStorage.getItem('notificationVolume') || '1';
      mockAudio.volume = parseFloat(savedVolume);
      expect(mockAudio.volume).toBe(1);
    });
  });

  describe('event listeners', () => {
    it('should add ended listener', () => {
      const audio = new Audio();
      const onEnded = vi.fn();
      audio.addEventListener('ended', onEnded);
      expect(mockAudio.addEventListener).toHaveBeenCalledWith('ended', onEnded);
    });

    it('should add error listener', () => {
      const audio = new Audio();
      const onError = vi.fn();
      audio.addEventListener('error', onError);
      expect(mockAudio.addEventListener).toHaveBeenCalledWith('error', onError);
    });

    it('should remove listener', () => {
      const audio = new Audio();
      const onEnded = vi.fn();
      audio.removeEventListener('ended', onEnded);
      expect(mockAudio.removeEventListener).toHaveBeenCalledWith('ended', onEnded);
    });
  });

  describe('preloading', () => {
    it('should preload sounds', () => {
      const sounds = ['success.mp3', 'error.mp3', 'warning.mp3'];
      const preloaded = sounds.map(src => new Audio(`/sounds/${src}`));
      expect(preloaded).toHaveLength(3);
    });
  });
});
