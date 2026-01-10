import type { Meta, StoryObj } from '@storybook/react';

// Placeholder component for story
const OnboardingWizard = () => <div>OnboardingWizard Component</div>;

const meta: Meta<typeof OnboardingWizard> = {
  title: 'Components/OnboardingWizard',
  component: OnboardingWizard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'OnboardingWizard component for the Sentinela application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof OnboardingWizard>;

export const Default: Story = {
  args: {},
};

export const WithCustomProps: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'OnboardingWizard with custom props.',
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'OnboardingWizard in loading state.',
      },
    },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'OnboardingWizard in error state.',
      },
    },
  },
};
