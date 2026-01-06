import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from '../components/ui/Headers';
import { Button } from '../components/ui/button';
import { Plus, Download, Settings } from 'lucide-react';

const meta: Meta<typeof PageHeader> = {
  title: 'UI/Headers',
  component: PageHeader,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Simple: Story = {
  args: { title: 'Dashboard', description: 'Overview of your activity' },
};

export const WithActions: Story = {
  args: {
    title: 'Employees',
    description: 'Manage your team members',
    actions: (
      <div className="flex gap-2">
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
        <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Employee</Button>
      </div>
    ),
  },
};

export const WithBreadcrumb: Story = {
  args: {
    title: 'Employee Details',
    description: 'View and edit employee information',
    breadcrumb: ['Home', 'Employees', 'John Doe'],
  },
};

export const Compact: Story = {
  args: { title: 'Settings', variant: 'compact' },
};
