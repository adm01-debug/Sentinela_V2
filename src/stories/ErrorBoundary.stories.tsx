import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from '../components/ui/error-boundary';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'UI/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

const ThrowError = () => { throw new Error('Test error'); };
const WorkingComponent = () => <div className="p-4 bg-green-100 rounded">This component works!</div>;

export const Default: Story = {
  render: () => (
    <ErrorBoundary>
      <WorkingComponent />
    </ErrorBoundary>
  ),
};

export const WithError: Story = {
  render: () => (
    <ErrorBoundary fallback={<div className="p-4 bg-red-100 text-red-800 rounded">Something went wrong!</div>}>
      <ThrowError />
    </ErrorBoundary>
  ),
};

export const CustomFallback: Story = {
  render: () => (
    <ErrorBoundary
      fallback={
        <div className="p-8 text-center border-2 border-dashed border-red-300 rounded-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Oops!</h2>
          <p className="text-gray-600">We encountered an error. Please try again.</p>
        </div>
      }
    >
      <ThrowError />
    </ErrorBoundary>
  ),
};
