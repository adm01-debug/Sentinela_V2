import type { Meta, StoryObj } from '@storybook/react';
import { ReportExportDialog } from './ReportExportDialog';

const meta: Meta<typeof ReportExportDialog> = {
  title: 'Components/ReportExportDialog',
  component: ReportExportDialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReportExportDialog>;

export const Default: Story = {};
