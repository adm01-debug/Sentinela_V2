import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};

export const WithLabel: StoryObj = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

export const SettingsExample: StoryObj = {
  render: () => (
    <div className="space-y-4 w-64">
      <div className="flex items-center justify-between">
        <Label htmlFor="notifications">Notifications</Label>
        <Switch id="notifications" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="emails">Email alerts</Label>
        <Switch id="emails" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="marketing">Marketing emails</Label>
        <Switch id="marketing" disabled />
      </div>
    </div>
  ),
};
