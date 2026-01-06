import * as React from 'react';
import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface VoiceInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  language?: string;
}

export function VoiceInput({ value = '', onChange, placeholder = 'Type or speak...', className, disabled = false, language = 'en-US' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
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
    <div className={cn('flex gap-2', className)}>
      <Input value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled} className="flex-1" />
      {isSupported && (
        <Button type="button" variant={isListening ? 'destructive' : 'outline'} size="icon" onClick={isListening ? stopListening : startListening} disabled={disabled}>
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}
export default VoiceInput;
