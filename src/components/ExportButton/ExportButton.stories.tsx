import type { Meta, StoryObj } from '@storybook/react';
import { ExportButton } from './ExportButton';

const meta: Meta<typeof ExportButton> = { title: 'Components/ExportButton', component: ExportButton, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof ExportButton>;
export const Default: Story = {};
