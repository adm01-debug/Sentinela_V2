import type { Meta, StoryObj } from '@storybook/react';
import { DeviceAssignDialog } from './DeviceAssignDialog';

const meta: Meta<typeof DeviceAssignDialog> = { title: 'Components/DeviceAssignDialog', component: DeviceAssignDialog, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof DeviceAssignDialog>;
export const Default: Story = {};
