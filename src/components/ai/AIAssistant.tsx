import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Send, Bot, User, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; }

export function AIAssistant({ className }: { className?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await supabase.functions.invoke('generate-insights', { body: { query: input, context: messages.slice(-5) } });
      const assistantMessage: Message = { id: crypto.randomUUID(), role: 'assistant', content: data?.response || 'I can help you analyze your data. Try asking about trends, anomalies, or recommendations.', timestamp: new Date() };
      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }]);
    } finally { setIsLoading(false); }
  }, [input, isLoading, messages]);

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="lg" className={cn('fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg', className)}>
        <Sparkles className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className={cn('fixed bottom-6 right-6 w-96 bg-background border rounded-lg shadow-2xl flex flex-col', className)} style={{ height: 500 }}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /><span className="font-semibold">AI Assistant</span></div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}><X className="h-4 w-4" /></Button>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>How can I help you today?</p>
            <p className="text-sm mt-2">Ask about trends, anomalies, or get recommendations.</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex gap-3 mb-4', msg.role === 'user' && 'flex-row-reverse')}>
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={cn('max-w-[80%] rounded-lg px-3 py-2', msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div><div className="bg-muted rounded-lg px-3 py-2"><p className="text-sm">Thinking...</p></div></div>}
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything..." disabled={isLoading} />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}><Send className="h-4 w-4" /></Button>
        </form>
      </div>
    </div>
  );
}
export default AIAssistant;
