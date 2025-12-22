import type { Meta, StoryObj } from '@storybook/react';
import { ScreenshotCard } from './ScreenshotCard';
const meta: Meta<typeof ScreenshotCard> = { title: 'Components/ScreenshotCard', component: ScreenshotCard };
export default meta;
type Story = StoryObj<typeof ScreenshotCard>;
export const Default: Story = {};
