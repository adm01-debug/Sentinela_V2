import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface PlaybackControlsProps {
  currentRecording: { recorded_at: string; app_name: string | null; window_title: string | null } | undefined;
  lastRecording: { recorded_at: string } | undefined;
  currentIndex: number;
  totalRecordings: number;
  progress: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onSliderChange: (value: number[]) => void;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onSpeedChange: (speed: number) => void;
}

export function PlaybackControls({
  currentRecording, lastRecording, currentIndex, totalRecordings,
  progress, isPlaying, playbackSpeed,
  onSliderChange, onPlayPause, onSkipBack, onSkipForward, onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground w-16">
          {currentRecording && format(new Date(currentRecording.recorded_at), "HH:mm:ss")}
        </span>
        <Slider value={[progress]} onValueChange={onSliderChange} max={100} step={0.1} className="flex-1" />
        <span className="text-sm text-muted-foreground w-16 text-right">
          {lastRecording && format(new Date(lastRecording.recorded_at), "HH:mm:ss")}
        </span>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={onSkipBack}><SkipBack className="h-4 w-4" /></Button>
        <Button size="icon" onClick={onPlayPause} disabled={totalRecordings === 0}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" onClick={onSkipForward}><SkipForward className="h-4 w-4" /></Button>
        <Select value={String(playbackSpeed)} onValueChange={(v) => onSpeedChange(Number(v))}>
          <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5">0.5x</SelectItem>
            <SelectItem value="1">1x</SelectItem>
            <SelectItem value="2">2x</SelectItem>
            <SelectItem value="4">4x</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span><strong>App:</strong> {currentRecording?.app_name || 'N/A'}</span>
          <span><strong>Janela:</strong> {currentRecording?.window_title?.substring(0, 40) || 'N/A'}</span>
        </div>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />{currentIndex + 1} / {totalRecordings}
        </span>
      </div>
    </div>
  );
}
