import type { Meta, StoryObj } from '@storybook/react';
import { MainNav } from './MainNav';

const meta: Meta<typeof MainNav> = { title: 'Components/MainNav', component: MainNav, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof MainNav>;
export const Default: Story = {};
