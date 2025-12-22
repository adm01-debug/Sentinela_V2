import type { Meta, StoryObj } from '@storybook/react';
import { LiveViewControls } from './LiveViewControls';

const meta: Meta<typeof LiveViewControls> = { title: 'Components/LiveViewControls', component: LiveViewControls, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof LiveViewControls>;
export const Default: Story = {};
