import * as React from "react";
import { useState, useCallback, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

export interface VoiceInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  language?: string;
}

export function VoiceInput({
  value = "",
  onChange,
  placeholder = "Type or speak...",
  className,
  disabled = false,
  language = "en-US",
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const w = window as unknown as WindowWithSpeech;
  const [isSupported] = useState(() => !!w.SpeechRecognition || !!w.webkitSpeechRecognition);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    const SpeechRecognitionCtor =
      (window as unknown as WindowWithSpeech).SpeechRecognition ||
      (window as unknown as WindowWithSpeech).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      onChange?.(value + transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [isSupported, language, onChange, value]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
      {isSupported && (
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}
export default VoiceInput;
