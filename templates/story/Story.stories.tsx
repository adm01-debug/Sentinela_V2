import type { Meta, StoryObj } from '@storybook/react';
import { Component } from './Component';
const meta: Meta<typeof Component> = { title: 'Components/Component', component: Component, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Component>;
export const Default: Story = { args: {} };
export const WithChildren: Story = { args: { children: 'Content' } };
