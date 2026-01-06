import type { Meta, StoryObj } from '@storybook/react';
import { LoadingStates, Spinner, Skeleton, ProgressLoader } from '../components/ui/LoadingStates';

const meta: Meta = {
  title: 'UI/LoadingStates',
  tags: ['autodocs'],
};
export default meta;

export const SpinnerVariants: StoryObj = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
};

export const SkeletonVariants: StoryObj = {
  render: () => (
    <div className="space-y-4 w-64">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  ),
};

export const ProgressLoaderVariants: StoryObj = {
  render: () => (
    <div className="space-y-4 w-64">
      <ProgressLoader progress={25} />
      <ProgressLoader progress={50} />
      <ProgressLoader progress={75} />
      <ProgressLoader progress={100} />
    </div>
  ),
};

export const CardSkeleton: StoryObj = {
  render: () => (
    <div className="border rounded-lg p-4 w-64">
      <Skeleton className="h-32 w-full mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};
