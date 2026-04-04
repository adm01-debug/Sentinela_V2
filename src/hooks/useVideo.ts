import { useState, useRef, useCallback } from "react";

export function useVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const play = useCallback(() => { videoRef.current?.play(); setPlaying(true); }, []);
  const pause = useCallback(() => { videoRef.current?.pause(); setPlaying(false); }, []);
  const toggle = useCallback(() => playing ? pause() : play(), [playing, play, pause]);
  const seek = useCallback((time: number) => { if (videoRef.current) videoRef.current.currentTime = time; }, []);

  const onTimeUpdate = useCallback(() => setCurrentTime(videoRef.current?.currentTime || 0), []);
  const onLoadedMetadata = useCallback(() => setDuration(videoRef.current?.duration || 0), []);

  return { videoRef, playing, currentTime, duration, play, pause, toggle, seek, handlers: { onTimeUpdate, onLoadedMetadata } };
}
