import * as React from 'react';
import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link, Image, Undo, Redo, Code, Quote } from 'lucide-react';

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minHeight?: number;
  maxHeight?: number;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
}

const ToolbarButton = ({ icon, onClick, active, disabled, title }: ToolbarButtonProps) => (
  <Button type="button" variant={active ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={onClick} disabled={disabled} title={title}>{icon}</Button>
);

export function RichTextEditor({ value = '', onChange, placeholder = 'Start typing...', className, disabled = false, minHeight = 150, maxHeight = 400 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (editorRef.current) onChange?.(editorRef.current.innerHTML);
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) onChange?.(editorRef.current.innerHTML);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b': e.preventDefault(); execCommand('bold'); break;
        case 'i': e.preventDefault(); execCommand('italic'); break;
        case 'u': e.preventDefault(); execCommand('underline'); break;
        case 'z': if (!e.shiftKey) { e.preventDefault(); execCommand('undo'); } else { e.preventDefault(); execCommand('redo'); } break;
      }
    }
  }, [execCommand]);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) execCommand('createLink', url);
  }, [execCommand]);

  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) execCommand('insertImage', url);
  }, [execCommand]);

  return (
    <div className={cn('border rounded-lg overflow-hidden', isFocused && 'ring-2 ring-ring', disabled && 'opacity-50', className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 border-b">
        <ToolbarButton icon={<Bold className="h-4 w-4" />} onClick={() => execCommand('bold')} title="Bold (Ctrl+B)" disabled={disabled} />
        <ToolbarButton icon={<Italic className="h-4 w-4" />} onClick={() => execCommand('italic')} title="Italic (Ctrl+I)" disabled={disabled} />
        <ToolbarButton icon={<Underline className="h-4 w-4" />} onClick={() => execCommand('underline')} title="Underline (Ctrl+U)" disabled={disabled} />
        <ToolbarButton icon={<Strikethrough className="h-4 w-4" />} onClick={() => execCommand('strikeThrough')} title="Strikethrough" disabled={disabled} />
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolbarButton icon={<List className="h-4 w-4" />} onClick={() => execCommand('insertUnorderedList')} title="Bullet List" disabled={disabled} />
        <ToolbarButton icon={<ListOrdered className="h-4 w-4" />} onClick={() => execCommand('insertOrderedList')} title="Numbered List" disabled={disabled} />
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolbarButton icon={<AlignLeft className="h-4 w-4" />} onClick={() => execCommand('justifyLeft')} title="Align Left" disabled={disabled} />
        <ToolbarButton icon={<AlignCenter className="h-4 w-4" />} onClick={() => execCommand('justifyCenter')} title="Align Center" disabled={disabled} />
        <ToolbarButton icon={<AlignRight className="h-4 w-4" />} onClick={() => execCommand('justifyRight')} title="Align Right" disabled={disabled} />
        <Separator orientation="vertical" className="h-6 mx-1" />
        <ToolbarButton icon={<Link className="h-4 w-4" />} onClick={insertLink} title="Insert Link" disabled={disabled} />
        <ToolbarButton icon={<Image className="h-4 w-4" />} onClick={insertImage} title="Insert Image" disabled={disabled} />
        <ToolbarButton icon={<Code className="h-4 w-4" />} onClick={() => execCommand('formatBlock', 'pre')} title="Code Block" disabled={disabled} />
        <ToolbarButton icon={<Quote className="h-4 w-4" />} onClick={() => execCommand('formatBlock', 'blockquote')} title="Quote" disabled={disabled} />
        <div className="flex-1" />
        <ToolbarButton icon={<Undo className="h-4 w-4" />} onClick={() => execCommand('undo')} title="Undo (Ctrl+Z)" disabled={disabled} />
        <ToolbarButton icon={<Redo className="h-4 w-4" />} onClick={() => execCommand('redo')} title="Redo (Ctrl+Shift+Z)" disabled={disabled} />
      </div>
      <div ref={editorRef} contentEditable={!disabled} className={cn('p-4 outline-none overflow-auto prose prose-sm max-w-none', 'focus:outline-none')} style={{ minHeight, maxHeight }} onInput={handleInput} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} onKeyDown={handleKeyDown} dangerouslySetInnerHTML={{ __html: value }} data-placeholder={placeholder} />
      <style>{`[data-placeholder]:empty:before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; }`}</style>
    </div>
  );
}
export default RichTextEditor;
