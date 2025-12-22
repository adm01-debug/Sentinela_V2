import type { Meta, StoryObj } from '@storybook/react';
import { HelpButton } from './HelpButton';

const meta: Meta<typeof HelpButton> = { title: 'Components/HelpButton', component: HelpButton, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof HelpButton>;
export const Default: Story = {};
