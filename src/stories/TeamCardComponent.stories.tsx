import type { Meta, StoryObj } from '@storybook/react';

const TeamCardComponent = () => <div>TeamCardComponent Component</div>;

const meta: Meta<typeof TeamCardComponent> = {
  title: 'Components/Teams/TeamCardComponent',
  component: TeamCardComponent,
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
