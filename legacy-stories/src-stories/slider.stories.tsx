import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '../components/ui/slider';

const meta: Meta<typeof Slider> = {
  title: 'UI/Slider',
  component: Slider,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
