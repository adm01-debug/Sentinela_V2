import type { Meta, StoryObj } from '@storybook/react';
import { ViolationChart } from './ViolationChart';
const meta: Meta<typeof ViolationChart> = { title: 'Components/ViolationChart', component: ViolationChart };
export default meta;
type Story = StoryObj<typeof ViolationChart>;
export const Default: Story = {};
