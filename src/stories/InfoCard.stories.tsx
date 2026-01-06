import type { Meta, StoryObj } from '@storybook/react';
import { InfoCard } from '../components/ui/InfoCard';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const meta: Meta<typeof InfoCard> = {
  title: 'UI/InfoCard',
  component: InfoCard,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof InfoCard>;

export const Info: Story = {
  args: {
    icon: <Info className="h-5 w-5" />,
    title: 'Information',
    description: 'This is an informational message.',
    variant: 'info',
  },
};

export const Success: Story = {
  args: {
    icon: <CheckCircle className="h-5 w-5" />,
    title: 'Success',
    description: 'Operation completed successfully.',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    icon: <AlertTriangle className="h-5 w-5" />,
    title: 'Warning',
    description: 'Please review before proceeding.',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    icon: <AlertCircle className="h-5 w-5" />,
    title: 'Error',
    description: 'Something went wrong. Please try again.',
    variant: 'error',
  },
};

export const WithAction: Story = {
  args: {
    icon: <Info className="h-5 w-5" />,
    title: 'New Feature',
    description: 'Check out our latest updates.',
    variant: 'info',
    action: { label: 'Learn More', onClick: () => alert('Clicked!') },
  },
};
