import type { Meta, StoryObj } from '@storybook/react';
import { TimelineView } from './TimelineView';
const meta: Meta<typeof TimelineView> = { title: 'Components/TimelineView', component: TimelineView };
export default meta;
type Story = StoryObj<typeof TimelineView>;
export const Default: Story = {};
