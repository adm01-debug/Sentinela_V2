import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Button } from '../Button/Button';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { content: 'Tooltip text', children: <Button>Hover me</Button> } };
export const Top: Story = { args: { content: 'Top tooltip', position: 'top', children: <Button>Top</Button> } };
export const Bottom: Story = { args: { content: 'Bottom tooltip', position: 'bottom', children: <Button>Bottom</Button> } };
export const Left: Story = { args: { content: 'Left tooltip', position: 'left', children: <Button>Left</Button> } };
export const Right: Story = { args: { content: 'Right tooltip', position: 'right', children: <Button>Right</Button> } };
export const WithDelay: Story = { args: { content: 'Delayed', delay: 500, children: <Button>Wait for it</Button> } };
