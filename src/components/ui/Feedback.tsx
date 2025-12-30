import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Star, ThumbsUp, ThumbsDown, Heart, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// ============================================
// STAR RATING
// ============================================

interface StarRatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  value,
  max = 5,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const displayValue = hoverValue ?? value;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayValue;

        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            className={cn(
              'transition-colors',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            )}
            onClick={() => !readonly && onChange?.(starValue)}
            onMouseEnter={() => !readonly && setHoverValue(starValue)}
            onMouseLeave={() => !readonly && setHoverValue(null)}
          >
            <Star
              className={cn(
                sizeStyles[size],
                isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
              )}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm font-medium">{value}/{max}</span>
      )}
    </div>
  );
}

// ============================================
// THUMBS RATING
// ============================================

interface ThumbsRatingProps {
  value?: 'up' | 'down' | null;
  onChange?: (value: 'up' | 'down' | null) => void;
  showCounts?: boolean;
  upCount?: number;
  downCount?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ThumbsRating({
  value,
  onChange,
  showCounts = false,
  upCount = 0,
  downCount = 0,
  size = 'md',
  className,
}: ThumbsRatingProps) {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleClick = (type: 'up' | 'down') => {
    if (value === type) {
      onChange?.(null);
    } else {
      onChange?.(type);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant={value === 'up' ? 'default' : 'ghost'}
        size="sm"
        className={cn(value === 'up' && 'bg-green-600 hover:bg-green-700')}
        onClick={() => handleClick('up')}
      >
        <ThumbsUp className={sizeStyles[size]} />
        {showCounts && <span className="ml-1">{upCount}</span>}
      </Button>
      <Button
        variant={value === 'down' ? 'default' : 'ghost'}
        size="sm"
        className={cn(value === 'down' && 'bg-red-600 hover:bg-red-700')}
        onClick={() => handleClick('down')}
      >
        <ThumbsDown className={sizeStyles[size]} />
        {showCounts && <span className="ml-1">{downCount}</span>}
      </Button>
    </div>
  );
}

// ============================================
// EMOJI RATING
// ============================================

interface EmojiRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const emojis = ['😢', '😕', '😐', '😊', '😍'];

export function EmojiRating({
  value,
  onChange,
  size = 'md',
  className,
}: EmojiRatingProps) {
  const sizeStyles = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {emojis.map((emoji, i) => (
        <button
          key={i}
          type="button"
          className={cn(
            'transition-all hover:scale-110',
            sizeStyles[size],
            value === i + 1 ? 'scale-125' : 'opacity-50 hover:opacity-100'
          )}
          onClick={() => onChange?.(i + 1)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

// ============================================
// LIKE BUTTON
// ============================================

interface LikeButtonProps {
  liked?: boolean;
  count?: number;
  onToggle?: (liked: boolean) => void;
  icon?: 'heart' | 'thumbsUp';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LikeButton({
  liked = false,
  count,
  onToggle,
  icon = 'heart',
  size = 'md',
  className,
}: LikeButtonProps) {
  const Icon = icon === 'heart' ? Heart : ThumbsUp;

  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('gap-1', className)}
      onClick={() => onToggle?.(!liked)}
    >
      <Icon
        className={cn(
          sizeStyles[size],
          'transition-all',
          liked && 'fill-red-500 text-red-500 animate-scale-in'
        )}
      />
      {count !== undefined && <span>{count}</span>}
    </Button>
  );
}

// ============================================
// FEEDBACK FORM
// ============================================

interface FeedbackFormProps {
  onSubmit: (data: { rating: number; feedback: string }) => void;
  title?: string;
  placeholder?: string;
  submitLabel?: string;
  ratingType?: 'stars' | 'emoji' | 'thumbs';
  className?: string;
}

export function FeedbackForm({
  onSubmit,
  title = 'Como foi sua experiência?',
  placeholder = 'Conte-nos mais sobre sua experiência...',
  submitLabel = 'Enviar feedback',
  ratingType = 'stars',
  className,
}: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ rating, feedback });
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="text-center space-y-3">
        <p className="font-medium">{title}</p>
        <div className="flex justify-center">
          {ratingType === 'stars' && (
            <StarRating value={rating} onChange={setRating} size="lg" />
          )}
          {ratingType === 'emoji' && (
            <EmojiRating value={rating} onChange={setRating} size="lg" />
          )}
        </div>
      </div>
      <Textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
      <Button type="submit" className="w-full" disabled={rating === 0}>
        {submitLabel}
      </Button>
    </form>
  );
}

// ============================================
// FEEDBACK DIALOG
// ============================================

interface FeedbackDialogProps {
  onSubmit: (data: { rating: number; feedback: string }) => void;
  trigger?: React.ReactNode;
  title?: string;
}

export function FeedbackDialog({
  onSubmit,
  trigger,
  title = 'Enviar feedback',
}: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (data: { rating: number; feedback: string }) => {
    onSubmit(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <FeedbackForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}

export default {
  StarRating,
  ThumbsRating,
  EmojiRating,
  LikeButton,
  FeedbackForm,
  FeedbackDialog,
};
