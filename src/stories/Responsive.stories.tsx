import type { Meta, StoryObj } from '@storybook/react';

const ResponsiveComponent = () => <div>Responsive Component</div>;

const meta: Meta<typeof ResponsiveComponent> = {
  title: 'UI/Responsive',
  component: ResponsiveComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Variants: Story = {
  args: {},
};

export const Interactive: Story = {
  args: {},
};
