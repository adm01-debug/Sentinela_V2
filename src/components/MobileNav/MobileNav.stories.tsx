import type { Meta, StoryObj } from '@storybook/react';
import { MobileNav } from './MobileNav';

const meta: Meta<typeof MobileNav> = { title: 'Components/MobileNav', component: MobileNav, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof MobileNav>;
export const Default: Story = {};
