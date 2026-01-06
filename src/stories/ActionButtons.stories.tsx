import type { Meta, StoryObj } from '@storybook/react';
import { ActionButtons } from '../components/ui/ActionButtons';
import { Edit, Trash2, Copy, MoreHorizontal } from 'lucide-react';

const meta: Meta<typeof ActionButtons> = {
  title: 'UI/ActionButtons',
  component: ActionButtons,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ActionButtons>;

export const Default: Story = {
  args: {
    actions: [
      { icon: <Edit className="h-4 w-4" />, label: 'Edit', onClick: () => alert('Edit clicked') },
      { icon: <Copy className="h-4 w-4" />, label: 'Copy', onClick: () => alert('Copy clicked') },
      { icon: <Trash2 className="h-4 w-4" />, label: 'Delete', onClick: () => alert('Delete clicked'), variant: 'destructive' },
    ],
  },
};

export const WithMenu: Story = {
  args: {
    actions: [
      { icon: <Edit className="h-4 w-4" />, label: 'Edit', onClick: () => {} },
    ],
    moreActions: [
      { label: 'Duplicate', onClick: () => {} },
      { label: 'Archive', onClick: () => {} },
      { label: 'Delete', onClick: () => {}, variant: 'destructive' },
    ],
  },
};

export const IconOnly: Story = {
  args: {
    actions: [
      { icon: <Edit className="h-4 w-4" />, onClick: () => {} },
      { icon: <Trash2 className="h-4 w-4" />, onClick: () => {} },
    ],
    showLabels: false,
  },
};
