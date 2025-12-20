import type { Meta, StoryObj } from '@storybook/react';
import { ReportCard } from '@/components/reports/ReportCard';

const meta: Meta<typeof ReportCard> = {
  title: 'Components/Reports/ReportCard',
  component: ReportCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Completed: Story = {
  args: {
    report: {
      id: '1',
      name: 'Relatório Mensal',
      type: 'productivity',
      status: 'completed',
      created_at: new Date().toISOString(),
      file_url: 'https://example.com/report.pdf',
    },
    onDownload: () => {},
    onDelete: () => {},
  },
};

export const Generating: Story = {
  args: {
    report: {
      id: '2',
      name: 'Relatório Semanal',
      type: 'violations',
      status: 'generating',
      created_at: new Date().toISOString(),
      file_url: null,
    },
    onDownload: () => {},
    onDelete: () => {},
  },
};

export const Failed: Story = {
  args: {
    report: {
      id: '3',
      name: 'Relatório Anual',
      type: 'summary',
      status: 'failed',
      created_at: new Date().toISOString(),
      file_url: null,
    },
    onDownload: () => {},
    onDelete: () => {},
  },
};
