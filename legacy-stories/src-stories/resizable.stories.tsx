import type { Meta, StoryObj } from '@storybook/react';
import { Resizable } from '../components/ui/resizable';

const meta: Meta<typeof Resizable> = {
  title: 'UI/Resizable',
  component: Resizable,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
