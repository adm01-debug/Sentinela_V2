import type { Meta, StoryObj } from "@storybook/react";
import { SearchAutocomplete } from "../components/ui/SearchAutocomplete";
import { User, Building, Mail } from "lucide-react";

const meta: Meta<typeof SearchAutocomplete> = { title: "UI/SearchAutocomplete", component: SearchAutocomplete, tags: ["autodocs"], parameters: { layout: "centered" } };
export default meta;

const options = [
  { value: "1", label: "John Doe", description: "Engineering", icon: <User className="h-4 w-4" /> },
  { value: "2", label: "Jane Smith", description: "Marketing", icon: <User className="h-4 w-4" /> },
  { value: "3", label: "Bob Wilson", description: "Sales", icon: <User className="h-4 w-4" /> },
];

export const Default: StoryObj = { render: () => <SearchAutocomplete options={options} placeholder="Search users..." className="w-64" /> };
export const WithAsync: StoryObj = { render: () => <SearchAutocomplete placeholder="Search..." onSearch={async (q) => options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()))} className="w-64" /> };
export const Disabled: StoryObj = { render: () => <SearchAutocomplete options={options} disabled className="w-64" /> };
