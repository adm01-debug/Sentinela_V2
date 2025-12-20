import type { Meta, StoryObj } from '@storybook/react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Search, Settings, User, Mail } from 'lucide-react';

const meta: Meta<typeof Command> = {
  title: 'UI/Command',
  component: Command,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[400px]">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem><User className="mr-2 h-4 w-4" /><span>Profile</span></CommandItem>
          <CommandItem><Mail className="mr-2 h-4 w-4" /><span>Mail</span></CommandItem>
          <CommandItem><Settings className="mr-2 h-4 w-4" /><span>Settings</span></CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
