import type { Meta, StoryObj } from '@storybook/react';
import { Chart } from './Chart';

const meta: Meta<typeof Chart> = {
  title: 'Components/Chart',
  component: Chart,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const lineData = [
  { month: 'Jan', value: 100 },
  { month: 'Feb', value: 120 },
  { month: 'Mar', value: 90 },
  { month: 'Apr', value: 150 },
  { month: 'May', value: 200 },
];

export const Line: Story = { args: { type: 'line', data: lineData, xKey: 'month', yKey: 'value' } };
export const Bar: Story = { args: { type: 'bar', data: lineData, xKey: 'month', yKey: 'value' } };
export const Area: Story = { args: { type: 'area', data: lineData, xKey: 'month', yKey: 'value' } };
export const Pie: Story = {
  args: {
    type: 'pie',
    data: [
      { name: 'A', value: 30 },
      { name: 'B', value: 25 },
      { name: 'C', value: 45 },
    ],
    nameKey: 'name',
    valueKey: 'value',
  },
};
export const WithLegend: Story = { args: { ...Line.args, showLegend: true } };
export const WithGrid: Story = { args: { ...Line.args, showGrid: true } };
