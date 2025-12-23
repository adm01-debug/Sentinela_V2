import type { Meta, StoryObj } from '@storybook/react';
import { IdentityProvidersList } from './IdentityProvidersList';

const meta: Meta<typeof IdentityProvidersList> = {
  title: 'Components/IdentityProvidersList',
  component: IdentityProvidersList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IdentityProvidersList>;

export const Default: Story = {};
