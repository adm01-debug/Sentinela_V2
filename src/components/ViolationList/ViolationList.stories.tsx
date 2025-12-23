import type { Meta, StoryObj } from '@storybook/react';
import { ViolationList } from './ViolationList';

const meta: Meta<typeof ViolationList> = {
  title: 'Components/ViolationList',
  component: ViolationList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ViolationList>;

export const Default: Story = {};
