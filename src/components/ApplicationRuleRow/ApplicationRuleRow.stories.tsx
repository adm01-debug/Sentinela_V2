import type { Meta, StoryObj } from '@storybook/react';
import { ApplicationRuleRow } from './ApplicationRuleRow';

const meta: Meta<typeof ApplicationRuleRow> = {
  title: 'Components/ApplicationRuleRow',
  component: ApplicationRuleRow,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ApplicationRuleRow>;

export const Default: Story = {};
