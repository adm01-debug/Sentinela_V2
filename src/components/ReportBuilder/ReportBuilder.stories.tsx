import type { Meta, StoryObj } from '@storybook/react';
import { ReportBuilder } from './ReportBuilder';

const meta: Meta<typeof ReportBuilder> = {
  title: 'Components/ReportBuilder',
  component: ReportBuilder,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ReportBuilder>;

export const Default: Story = {};
