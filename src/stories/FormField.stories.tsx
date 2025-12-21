import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from '@/components/FormField';

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = { args: {} };
export const WithCustomClass: Story = { args: { className: 'custom-class' } };
