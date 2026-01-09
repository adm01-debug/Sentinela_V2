import type { Meta, StoryObj } from '@storybook/react';
import { Popover } from './Popover';
import { Button } from '../Button/Button';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { trigger: <Button>Click me</Button>, children: <div style={{padding: 16}}>Popover content</div> },
};
export const WithTitle: Story = {
  args: { trigger: <Button>Info</Button>, title: 'Details', children: 'Additional information here' },
};
export const Controlled: Story = {
  args: { trigger: <Button>Controlled</Button>, isOpen: true, children: 'Always visible' },
};
