import type { Meta, StoryObj } from '@storybook/react';

const RulesListComponent = () => <div>RulesListComponent Component</div>;

const meta: Meta<typeof RulesListComponent> = {
  title: 'Components/Rules/RulesListComponent',
  component: RulesListComponent,
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
