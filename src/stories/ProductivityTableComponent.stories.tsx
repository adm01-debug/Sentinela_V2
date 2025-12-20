import type { Meta, StoryObj } from '@storybook/react';

const ProductivityTableComponent = () => <div>ProductivityTableComponent Component</div>;

const meta: Meta<typeof ProductivityTableComponent> = {
  title: 'Components/Productivity/ProductivityTableComponent',
  component: ProductivityTableComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Loading: Story = {
  args: {},
};

export const Empty: Story = {
  args: {},
};

export const WithData: Story = {
  args: {},
};
