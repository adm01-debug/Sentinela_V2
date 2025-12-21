import { desktopCapturer } from 'electron';

export async function startRecording(): Promise<MediaStream> {
  const sources = await desktopCapturer.getSources({ types: ['screen'] });
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: sources[0].id } } as any
  });
  return stream;
}

export function stopRecording(stream: MediaStream) { stream.getTracks().forEach(t => t.stop()); }