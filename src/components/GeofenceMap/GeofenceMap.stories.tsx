import type { Meta, StoryObj } from '@storybook/react';
import { GeofenceMap } from './GeofenceMap';

const meta: Meta<typeof GeofenceMap> = { title: 'Components/GeofenceMap', component: GeofenceMap, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof GeofenceMap>;
export const Default: Story = {};
