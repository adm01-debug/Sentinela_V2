import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmButton } from '@/components/ui/confirmbutton';

const meta: Meta<typeof ConfirmButton> = {
  title: 'UI/ConfirmButton',
  component: ConfirmButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithProps: Story = {
  args: {},
};
