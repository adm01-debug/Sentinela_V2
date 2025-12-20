import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const meta: Meta = {
  title: 'UI/Toast',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const ToastDemo = () => {
  const { toast } = useToast();
  return (
    <div className="flex gap-2">
      <Button onClick={() => toast({ title: 'Success', description: 'Operation completed.' })}>
        Show Toast
      </Button>
      <Button variant="destructive" onClick={() => toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' })}>
        Show Error
      </Button>
    </div>
  );
};

export const Default: Story = {
  render: () => <ToastDemo />,
};
