import type { Meta, StoryObj } from '@storybook/react';
import { ReportList } from './ReportList';
const meta: Meta<typeof ReportList> = { title: 'Components/ReportList', component: ReportList };
export default meta;
type Story = StoryObj<typeof ReportList>;
export const Default: Story = {};
