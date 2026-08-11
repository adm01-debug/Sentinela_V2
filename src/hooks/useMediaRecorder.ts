import { useState, useRef, useCallback, useEffect } from 'react';

interface UseMediaRecorderOptions {
  audio?: boolean;
  video?: boolean;
  mimeType?: string;
}

interface MediaRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  error: Error | null;
}

export function useMediaRecorder(options: UseMediaRecorderOptions = { audio: true }) {
  const [state, setState] = useState<MediaRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    error: null,
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: options.audio ?? true,
        video: options.video ?? false,
      });

      const mimeType = options.mimeType || (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onerror = () => setState(s => ({ ...s, error: new Error('Recording error') }));

      recorder.start(1000);
      mediaRecorderRef.current = recorder;

      timerRef.current = setInterval(() => {
        setState(s => ({ ...s, duration: s.duration + 1 }));
      }, 1000);

      setState({ isRecording: true, isPaused: false, duration: 0, error: null });
    } catch (err) {
      setState(s => ({ ...s, error: err instanceof Error ? err : new Error('Failed to start recording') }));
    }
  }, [options]);

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        recorder.stream.getTracks().forEach(t => t.stop());
        resolve(blob);
      };

      recorder.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setState(s => ({ ...s, isRecording: false, isPaused: false }));
    });
  }, []);

  const pause = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setState(s => ({ ...s, isPaused: true }));
    }
  }, []);

  const resume = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setState(s => ({ ...s, duration: s.duration + 1 }));
      }, 1000);
      setState(s => ({ ...s, isPaused: false }));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  return { ...state, start, stop, pause, resume };
}
