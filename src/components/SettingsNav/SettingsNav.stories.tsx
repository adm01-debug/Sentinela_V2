import type { Meta, StoryObj } from '@storybook/react';
import { SettingsNav } from './SettingsNav';
const meta: Meta<typeof SettingsNav> = { title: 'Components/SettingsNav', component: SettingsNav };
export default meta;
type Story = StoryObj<typeof SettingsNav>;
export const Default: Story = {};
