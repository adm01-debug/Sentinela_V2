import { desktopCapturer } from 'electron';

export async function captureScreen(): Promise<string> {
  const sources = await desktopCapturer.getSources({ types: ['screen'] });
  return sources[0]?.thumbnail.toDataURL() || '';
}
