import type { Meta, StoryObj } from '@storybook/react';
import { UserAvatar } from './UserAvatar';
const meta: Meta<typeof UserAvatar> = { title: 'Components/UserAvatar', component: UserAvatar };
export default meta;
type Story = StoryObj<typeof UserAvatar>;
export const Default: Story = {};
