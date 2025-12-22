import type { Meta, StoryObj } from '@storybook/react';
import { DeviceCard } from './DeviceCard';

const meta: Meta<typeof DeviceCard> = { title: 'Components/DeviceCard', component: DeviceCard, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof DeviceCard>;
export const Default: Story = {};
