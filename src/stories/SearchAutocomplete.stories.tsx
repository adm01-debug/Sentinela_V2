import type { Meta, StoryObj } from "@storybook/react";
import { SearchAutocomplete } from "../components/ui/SearchAutocomplete";
import { User, Building, Mail } from "lucide-react";

const meta: Meta<typeof SearchAutocomplete> = {
  title: "UI/SearchAutocomplete",
  component: SearchAutocomplete,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockOptions = [
  { value: "1", label: "John Doe", description: "Engineering", icon: <User className="h-4 w-4" /> },
  { value: "2", label: "Jane Smith", description: "Marketing", icon: <User className="h-4 w-4" /> },
  { value: "3", label: "Bob Johnson", description: "Sales", icon: <User className="h-4 w-4" /> },
];

export const Default: Story = {
  args: {
    options: mockOptions,
    placeholder: "Search employees...",
    className: "w-64",
  },
};

export const WithAsyncSearch: Story = {
  args: {
    placeholder: "Search users...",
    className: "w-64",
    onSearch: async (query) => {
      await new Promise(r => setTimeout(r, 500));
      return mockOptions.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));
    },
  },
};

export const Disabled: Story = {
  args: {
    options: mockOptions,
    disabled: true,
    className: "w-64",
  },
};
