import type { Meta, StoryObj } from "@storybook/react";
import { DataGrid } from "../components/ui/DataGrid";
import { Badge } from "../components/ui/badge";

const meta: Meta<typeof DataGrid> = {
  title: "UI/DataGrid",
  component: DataGrid,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockData = [
  { id: "1", name: "John Doe", email: "john@example.com", status: "active", role: "Admin" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", status: "active", role: "User" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", status: "inactive", role: "User" },
  { id: "4", name: "Alice Brown", email: "alice@example.com", status: "active", role: "Manager" },
  { id: "5", name: "Charlie Wilson", email: "charlie@example.com", status: "pending", role: "User" },
];

const columns = [
  { id: "name", header: "Name", accessor: "name" as const, sortable: true },
  { id: "email", header: "Email", accessor: "email" as const, sortable: true },
  { id: "role", header: "Role", accessor: "role" as const },
  { 
    id: "status", 
    header: "Status", 
    accessor: "status" as const,
    render: (value: string) => (
      <Badge variant={value === "active" ? "default" : value === "pending" ? "secondary" : "outline"}>
        {value}
      </Badge>
    )
  },
];

export const Default: Story = {
  args: {
    data: mockData,
    columns,
    keyExtractor: (row) => row.id,
  },
};

export const Selectable: Story = {
  args: {
    data: mockData,
    columns,
    keyExtractor: (row) => row.id,
    selectable: true,
    onSelectionChange: (ids) => console.log("Selected:", ids),
  },
};

export const WithPagination: Story = {
  args: {
    data: [...mockData, ...mockData, ...mockData],
    columns,
    keyExtractor: (row) => row.id,
    pagination: true,
    pageSize: 5,
  },
};

export const Filterable: Story = {
  args: {
    data: mockData,
    columns,
    keyExtractor: (row) => row.id,
    filterable: true,
  },
};
