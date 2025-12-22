import type { Meta, StoryObj } from '@storybook/react';
import { GeofenceList } from './GeofenceList';

const meta: Meta<typeof GeofenceList> = { title: 'Components/GeofenceList', component: GeofenceList, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof GeofenceList>;
export const Default: Story = {};
