import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const EmployeeCard = () => <div>EmployeeCard Component</div>;

const meta: Meta<typeof EmployeeCard> = {
  title: 'Components/EmployeeCard',
  component: EmployeeCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'EmployeeCard component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof EmployeeCard>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'EmployeeCard with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'EmployeeCard in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'EmployeeCard in error state.',
      },
    },
  },
};
