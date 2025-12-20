import type { Meta, StoryObj } from '@storybook/react';

const PolicyCardComponent = () => <div>PolicyCardComponent Component</div>;

const meta: Meta<typeof PolicyCardComponent> = {
  title: 'Components/Policies/PolicyCardComponent',
  component: PolicyCardComponent,
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
