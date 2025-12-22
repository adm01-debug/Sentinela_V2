import type { Meta, StoryObj } from '@storybook/react';
import { SystemStatus } from './SystemStatus';
const meta: Meta<typeof SystemStatus> = { title: 'Components/SystemStatus', component: SystemStatus };
export default meta;
type Story = StoryObj<typeof SystemStatus>;
export const Default: Story = {};
