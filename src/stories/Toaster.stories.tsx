import type { Meta, StoryObj } from '@storybook/react';
import { Toaster } from '../components/ui/toaster';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';

const meta: Meta = {
  title: 'UI/Toaster',
  component: Toaster,
  tags: ['autodocs'],
};
export default meta;

const ToastDemo = () => {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast({ title: 'Default Toast', description: 'This is a default toast message.' })}>Default</Button>
      <Button variant="outline" onClick={() => toast({ title: 'Success!', description: 'Operation completed successfully.', variant: 'default' })}>Success</Button>
      <Button variant="destructive" onClick={() => toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' })}>Error</Button>
      <Button variant="secondary" onClick={() => toast({ title: 'With Action', description: 'Click to undo.', action: <Button variant="outline" size="sm">Undo</Button> })}>With Action</Button>
    </div>
  );
};

export const Interactive: StoryObj = {
  render: () => (
    <>
      <ToastDemo />
      <Toaster />
    </>
  ),
};

export const Positioning: StoryObj = {
  render: () => (
    <div className="text-sm text-muted-foreground">
      <p>The Toaster component displays notifications at the bottom-right of the screen by default.</p>
      <p>Click the buttons above to see toasts in action.</p>
    </div>
  ),
};
