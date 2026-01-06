import type { Meta, StoryObj } from "@storybook/react";
import { LoadingStates } from "../components/ui/LoadingStates";
import { Skeleton } from "../components/ui/skeleton";

const meta: Meta<typeof LoadingStates> = {
  title: "UI/LoadingStates",
  component: LoadingStates,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Spinner: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <LoadingStates type="spinner" size="sm" />
      <LoadingStates type="spinner" size="md" />
      <LoadingStates type="spinner" size="lg" />
    </div>
  ),
};

export const Dots: Story = {
  render: () => (
    <LoadingStates type="dots" />
  ),
};

export const SkeletonCard: Story = {
  render: () => (
    <div className="w-64 space-y-3">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};

export const SkeletonList: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <LoadingStates type="spinner" text="Loading data..." />
  ),
};
