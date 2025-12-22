import type { Meta, StoryObj } from '@storybook/react';
import { ViolationAlert } from './ViolationAlert';
const meta: Meta<typeof ViolationAlert> = { title: 'Components/ViolationAlert', component: ViolationAlert };
export default meta;
type Story = StoryObj<typeof ViolationAlert>;
export const Default: Story = {};
