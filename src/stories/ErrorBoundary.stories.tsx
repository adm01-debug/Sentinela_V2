import type { Meta, StoryObj } from "@storybook/react";
import { ErrorBoundary } from "../components/ui/error-boundary";

const meta: Meta<typeof ErrorBoundary> = {
  title: "UI/ErrorBoundary",
  component: ErrorBoundary,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof meta>;

const ThrowError = () => {
  throw new Error("Test error for demonstration");
};

const SafeComponent = () => <div className="p-4 border rounded">Safe Content</div>;

export const WithError: Story = {
  render: () => (
    <ErrorBoundary fallback={<div className="p-4 bg-red-100 text-red-800 rounded">Something went wrong!</div>}>
      <ThrowError />
    </ErrorBoundary>
  ),
};

export const WithoutError: Story = {
  render: () => (
    <ErrorBoundary fallback={<div>Error occurred</div>}>
      <SafeComponent />
    </ErrorBoundary>
  ),
};

export const CustomFallback: Story = {
  render: () => (
    <ErrorBoundary
      fallback={
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-800">Oops!</h3>
          <p className="text-yellow-700">An error occurred. Please try again.</p>
          <button className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
            Reload
          </button>
        </div>
      }
    >
      <ThrowError />
    </ErrorBoundary>
  ),
};
