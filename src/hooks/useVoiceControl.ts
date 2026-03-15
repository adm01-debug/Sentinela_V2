import { useState, useEffect, useCallback, useRef } from 'react';

export interface VoiceCommand {
  command: string | RegExp;
  callback: (transcript: string, ...matches: string[]) => void;
  description?: string;
}

export interface UseVoiceControlOptions {
  commands?: VoiceCommand[];
  continuous?: boolean;
  language?: string;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceControl(options: UseVoiceControlOptions = {}) {
  const { commands = [], continuous = false, language = 'en-US', onResult, onError } = options;
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = false;
      recognition.lang = language;
      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.trim().toLowerCase();
        setTranscript(text);
        onResult?.(text);
        commands.forEach(cmd => {
          if (typeof cmd.command === 'string') {
            if (text.includes(cmd.command.toLowerCase())) cmd.callback(text);
          } else {
            const match = text.match(cmd.command);
            if (match) cmd.callback(text, ...match.slice(1));
          }
        });
      };
      recognition.onerror = (event: any) => { onError?.(event.error); setIsListening(false); };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
    return () => { if (recognitionRef.current) recognitionRef.current.abort(); };
  }, [commands, continuous, language, onResult, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) { recognitionRef.current.start(); setIsListening(true); setTranscript(''); }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) { recognitionRef.current.stop(); setIsListening(false); }
  }, [isListening]);

  const toggleListening = useCallback(() => { isListening ? stopListening() : startListening(); }, [isListening, startListening, stopListening]);

  return { isListening, isSupported, transcript, startListening, stopListening, toggleListening };
}

export default useVoiceControl;
