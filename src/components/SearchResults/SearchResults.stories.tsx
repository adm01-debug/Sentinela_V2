import type { Meta, StoryObj } from '@storybook/react';
import { SearchResults } from './SearchResults';
const meta: Meta<typeof SearchResults> = { title: 'Components/SearchResults', component: SearchResults };
export default meta;
type Story = StoryObj<typeof SearchResults>;
export const Default: Story = {};
