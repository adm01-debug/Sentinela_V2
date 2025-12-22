import type { Meta, StoryObj } from '@storybook/react';
import { FeatureCard } from './FeatureCard';

const meta: Meta<typeof FeatureCard> = { title: 'Components/FeatureCard', component: FeatureCard, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof FeatureCard>;
export const Default: Story = {};
