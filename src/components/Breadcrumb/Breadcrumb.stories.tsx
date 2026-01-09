import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/products">Products</BreadcrumbItem>
        <BreadcrumbItem>Details</BreadcrumbItem>
      </>
    ),
  },
};
export const WithSeparator: Story = { args: { ...Default.args, separator: '>' } };
export const WithIcons: Story = {
  args: {
    children: (
      <>
        <BreadcrumbItem href="/" icon="🏠">Home</BreadcrumbItem>
        <BreadcrumbItem href="/settings" icon="⚙️">Settings</BreadcrumbItem>
        <BreadcrumbItem>Profile</BreadcrumbItem>
      </>
    ),
  },
};
