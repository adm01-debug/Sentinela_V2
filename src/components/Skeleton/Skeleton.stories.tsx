import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = { args: { variant: 'text' } };
export const Circle: Story = { args: { variant: 'circle', width: 40, height: 40 } };
export const Rectangle: Story = { args: { variant: 'rectangle', width: 200, height: 100 } };
export const Card: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <Skeleton variant="rectangle" height={200} />
      <Skeleton variant="text" style={{ marginTop: 8 }} />
      <Skeleton variant="text" width="60%" />
    </div>
  ),
};
export const Avatar: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Skeleton variant="circle" width={48} height={48} />
      <div>
        <Skeleton variant="text" width={120} />
        <Skeleton variant="text" width={80} />
      </div>
    </div>
  ),
};
