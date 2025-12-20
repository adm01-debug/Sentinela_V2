import type { Meta, StoryObj } from '@storybook/react';
import { PageContainer } from '@/components/ui/pagecontainer';

const meta: Meta<typeof PageContainer> = {
  title: 'UI/PageContainer',
  component: PageContainer,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithProps: Story = {
  args: {},
};
