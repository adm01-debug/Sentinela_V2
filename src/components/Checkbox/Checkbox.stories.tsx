import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: 'Accept terms and conditions' } };
export const Checked: Story = { args: { label: 'Checked', checked: true } };
export const Disabled: Story = { args: { label: 'Disabled', disabled: true } };
export const DisabledChecked: Story = { args: { label: 'Disabled Checked', disabled: true, checked: true } };
export const WithDescription: Story = { args: { label: 'Newsletter', description: 'Receive weekly updates' } };
export const Indeterminate: Story = { args: { label: 'Select All', indeterminate: true } };
