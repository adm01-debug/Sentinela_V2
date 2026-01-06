import type { Meta, StoryObj } from "@storybook/react";
import { KanbanBoard } from "../components/ui/KanbanBoard";

const meta: Meta<typeof KanbanBoard> = {
  title: "UI/KanbanBoard",
  component: KanbanBoard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockColumns = [
  {
    id: "todo",
    title: "To Do",
    color: "#6366f1",
    cards: [
      { id: "1", title: "Design new dashboard", description: "Create wireframes for the new dashboard", labels: [{ text: "Design", color: "#8b5cf6" }], priority: "high" as const },
      { id: "2", title: "Review PRs", description: "Review pending pull requests", priority: "medium" as const },
    ],
  },
  {
    id: "progress",
    title: "In Progress",
    color: "#f59e0b",
    cards: [
      { id: "3", title: "Implement auth flow", description: "Add OAuth integration", labels: [{ text: "Backend", color: "#22c55e" }], priority: "high" as const },
    ],
  },
  {
    id: "done",
    title: "Done",
    color: "#22c55e",
    cards: [
      { id: "4", title: "Setup CI/CD", description: "Configure GitHub Actions", labels: [{ text: "DevOps", color: "#06b6d4" }] },
    ],
  },
];

export const Default: Story = {
  args: {
    columns: mockColumns,
    onCardClick: (card, column) => console.log("Clicked:", card, column),
    onCardMove: (cardId, from, to) => console.log("Move:", cardId, from, "->", to),
  },
};

export const WithAddCard: Story = {
  args: {
    columns: mockColumns,
    onAddCard: (columnId) => console.log("Add card to:", columnId),
  },
};
