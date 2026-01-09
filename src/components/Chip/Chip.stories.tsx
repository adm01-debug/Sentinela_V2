import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Chip' } };
export const Clickable: Story = { args: { children: 'Clickable', onClick: () => {} } };
export const Deletable: Story = { args: { children: 'Deletable', onDelete: () => {} } };
export const WithAvatar: Story = { args: { children: 'John Doe', avatar: 'JD' } };
export const Outlined: Story = { args: { children: 'Outlined', variant: 'outlined' } };
export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Chip color="primary">Primary</Chip>
      <Chip color="success">Success</Chip>
      <Chip color="warning">Warning</Chip>
      <Chip color="danger">Danger</Chip>
    </div>
  ),
};
