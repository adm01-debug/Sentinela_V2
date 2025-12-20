import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ViolationCard } from '@/components/violations/ViolationCard';

const queryClient = new QueryClient();

const meta: Meta<typeof ViolationCard> = {
  title: 'Components/Violations/ViolationCard',
  component: ViolationCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Story />
        </BrowserRouter>
      </QueryClientProvider>
    ),
  ],
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
  parameters: {
    mockData: { isLoading: true },
  },
};

export const Empty: Story = {
  args: {},
  parameters: {
    mockData: { data: [] },
  },
};

export const WithData: Story = {
  args: {},
  parameters: {
    mockData: { data: ['item1', 'item2'] },
  },
};

export const Error: Story = {
  args: {},
  parameters: {
    mockData: { error: new Error('Test error') },
  },
};
