import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Switch component for toggling boolean settings.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Controlled checked state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Switch />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <Switch id="disabled-off" disabled />
        <Label htmlFor="disabled-off" className="text-muted-foreground">Disabled (off)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="disabled-on" disabled checked />
        <Label htmlFor="disabled-on" className="text-muted-foreground">Disabled (on)</Label>
      </div>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="controlled" 
            checked={checked} 
            onCheckedChange={setChecked}
          />
          <Label htmlFor="controlled">
            {checked ? 'Enabled' : 'Disabled'}
          </Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Current state: {checked ? 'ON' : 'OFF'}
        </p>
      </div>
    );
  },
};

export const SettingsPanel: Story = {
  render: () => {
    const [notifications, setNotifications] = useState(true);
    const [marketing, setMarketing] = useState(false);
    const [security, setSecurity] = useState(true);
    
    return (
      <div className="space-y-6 w-[350px]">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications" className="text-base">Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications about updates
            </p>
          </div>
          <Switch
            id="notifications"
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing" className="text-base">Marketing emails</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about new products
            </p>
          </div>
          <Switch
            id="marketing"
            checked={marketing}
            onCheckedChange={setMarketing}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="security" className="text-base">Security alerts</Label>
            <p className="text-sm text-muted-foreground">
              Get notified of security issues
            </p>
          </div>
          <Switch
            id="security"
            checked={security}
            onCheckedChange={setSecurity}
          />
        </div>
      </div>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex gap-4">
      <div className="flex items-center space-x-2">
        <Switch />
        <Label>Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch defaultChecked />
        <Label>Checked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch disabled />
        <Label className="text-muted-foreground">Disabled</Label>
      </div>
    </div>
  ),
};
