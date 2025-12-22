import type { Meta, StoryObj } from '@storybook/react';
import { ViolationCard } from './ViolationCard';
const meta: Meta<typeof ViolationCard> = { title: 'Components/ViolationCard', component: ViolationCard };
export default meta;
type Story = StoryObj<typeof ViolationCard>;
export const Default: Story = {};
