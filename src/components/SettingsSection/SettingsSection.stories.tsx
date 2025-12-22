import type { Meta, StoryObj } from '@storybook/react';
import { SettingsSection } from './SettingsSection';
const meta: Meta<typeof SettingsSection> = { title: 'Components/SettingsSection', component: SettingsSection };
export default meta;
type Story = StoryObj<typeof SettingsSection>;
export const Default: Story = {};
