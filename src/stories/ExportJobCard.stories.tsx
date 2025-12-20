import type { Meta, StoryObj } from '@storybook/react';
import { ExportJobCard } from '@/components/export/ExportJobCard';

const meta: Meta<typeof ExportJobCard> = {
  title: 'Components/Export/ExportJobCard',
  component: ExportJobCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Completed: Story = {
  args: {
    job: {
      id: '1',
      type: 'employees',
      format: 'csv',
      status: 'completed',
      progress: 100,
      file_url: 'https://example.com/export.csv',
      error_message: null,
      created_at: new Date().toISOString(),
      record_count: 150,
    },
    onDownload: () => {},
    onCancel: () => {},
    onDelete: () => {},
  },
};

export const Processing: Story = {
  args: {
    job: {
      id: '2',
      type: 'violations',
      format: 'xlsx',
      status: 'processing',
      progress: 65,
      file_url: null,
      error_message: null,
      created_at: new Date().toISOString(),
      record_count: null,
    },
    onDownload: () => {},
    onCancel: () => {},
    onDelete: () => {},
  },
};

export const Failed: Story = {
  args: {
    job: {
      id: '3',
      type: 'activities',
      format: 'json',
      status: 'failed',
      progress: 0,
      file_url: null,
      error_message: 'Timeout ao processar dados',
      created_at: new Date().toISOString(),
      record_count: null,
    },
    onDownload: () => {},
    onCancel: () => {},
    onDelete: () => {},
  },
};
