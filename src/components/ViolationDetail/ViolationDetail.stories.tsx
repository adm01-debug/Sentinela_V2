import type { Meta, StoryObj } from '@storybook/react';
import { ViolationDetail } from './ViolationDetail';

const meta: Meta<typeof ViolationDetail> = {
  title: 'Components/ViolationDetail',
  component: ViolationDetail,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ViolationDetail>;

export const Default: Story = {};
