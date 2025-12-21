import type { Meta, StoryObj } from '@storybook/react';
import { LocationMap } from '@/components/LocationMap';

const meta: Meta<typeof LocationMap> = {
  title: 'Components/LocationMap',
  component: LocationMap,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof LocationMap>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
