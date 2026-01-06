import type { Meta, StoryObj } from "@storybook/react";
import { DataGrid } from "../components/ui/DataGrid";

const meta: Meta<typeof DataGrid> = { title: "UI/DataGrid", component: DataGrid, tags: ["autodocs"] };
export default meta;

const data = Array.from({ length: 20 }, (_, i) => ({ id: String(i + 1), name: `User ${i + 1}`, email: `user${i + 1}@example.com`, role: i % 3 === 0 ? "Admin" : "User", status: i % 4 === 0 ? "Inactive" : "Active" }));
const columns = [
  { id: "name", header: "Name", accessor: "name" as const, sortable: true },
  { id: "email", header: "Email", accessor: "email" as const, sortable: true },
  { id: "role", header: "Role", accessor: "role" as const, sortable: true },
  { id: "status", header: "Status", accessor: "status" as const },
];

export const Default: StoryObj = { render: () => <DataGrid data={data} columns={columns} keyExtractor={(row) => row.id} /> };
export const Selectable: StoryObj = { render: () => <DataGrid data={data} columns={columns} keyExtractor={(row) => row.id} selectable /> };
export const WithPagination: StoryObj = { render: () => <DataGrid data={data} columns={columns} keyExtractor={(row) => row.id} pagination pageSize={5} /> };
export const WithFilters: StoryObj = { render: () => <DataGrid data={data} columns={columns} keyExtractor={(row) => row.id} filterable /> };
