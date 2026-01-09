import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: 'opt1', label: 'Option 1' },
  { value: 'opt2', label: 'Option 2' },
  { value: 'opt3', label: 'Option 3' },
];

export const Default: Story = { args: { options, placeholder: 'Select an option' } };
export const WithLabel: Story = { args: { options, label: 'Choose', placeholder: 'Select...' } };
export const WithError: Story = { args: { options, error: 'Selection required' } };
export const Disabled: Story = { args: { options, disabled: true } };
export const Multiple: Story = { args: { options, multiple: true, placeholder: 'Select multiple' } };
export const Searchable: Story = { args: { options, searchable: true, placeholder: 'Type to search' } };
