import { useState, useCallback, useRef } from "react";

interface SpeechRecognitionResult {
  readonly 0: { transcript: string };
}

interface SpeechRecognitionEvent {
  results: ArrayLike<SpeechRecognitionResult>;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

interface WindowWithSpeech {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const start = useCallback(() => {
    const w = window as unknown as WindowWithSpeech;
    const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    recognitionRef.current = new SpeechRecognitionCtor();
    recognitionRef.current.continuous = true;
    recognitionRef.current.onresult = (e: SpeechRecognitionEvent) => {
      setTranscript(Array.from(e.results).map((r: any) => r[0].transcript).join(""));
    };
    recognitionRef.current.start();
    setListening(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { transcript, listening, start, stop };
}
