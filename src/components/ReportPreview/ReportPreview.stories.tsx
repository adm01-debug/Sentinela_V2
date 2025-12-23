import type { Meta, StoryObj } from '@storybook/react';
import { ReportPreview } from './ReportPreview';

const meta: Meta<typeof ReportPreview> = {
  title: 'Components/ReportPreview',
  component: ReportPreview,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReportPreview>;

export const Default: Story = {};
