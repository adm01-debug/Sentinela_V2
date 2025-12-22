import type { Meta, StoryObj } from '@storybook/react';
import { FilterPanel } from './FilterPanel';

const meta: Meta<typeof FilterPanel> = { title: 'Components/FilterPanel', component: FilterPanel, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof FilterPanel>;
export const Default: Story = {};
