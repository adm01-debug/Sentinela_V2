import type { Meta, StoryObj } from '@storybook/react';
import { SidebarSection } from './SidebarSection';

const meta: Meta<typeof SidebarSection> = {
  title: 'Components/SidebarSection',
  component: SidebarSection,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SidebarSection>;

export const Default: Story = {};
