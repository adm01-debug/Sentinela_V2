import type { Meta, StoryObj } from '@storybook/react';
import { TwoFactorForm } from './TwoFactorForm';
const meta: Meta<typeof TwoFactorForm> = { title: 'Components/TwoFactorForm', component: TwoFactorForm };
export default meta;
type Story = StoryObj<typeof TwoFactorForm>;
export const Default: Story = {};
