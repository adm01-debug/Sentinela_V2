import type { Meta, StoryObj } from '@storybook/react';
import { DeviceStats } from './DeviceStats';

const meta: Meta<typeof DeviceStats> = { title: 'Components/DeviceStats', component: DeviceStats, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof DeviceStats>;
export const Default: Story = {};
