import type { Meta, StoryObj } from "@storybook/react";
import { KanbanBoard } from "../components/ui/KanbanBoard";

const meta: Meta<typeof KanbanBoard> = { title: "UI/KanbanBoard", component: KanbanBoard, tags: ["autodocs"] };
export default meta;

const columns = [
  { id: "todo", title: "To Do", color: "#6366f1", cards: [{ id: "1", title: "Task 1", description: "Description" }, { id: "2", title: "Task 2" }] },
  { id: "progress", title: "In Progress", color: "#f59e0b", cards: [{ id: "3", title: "Task 3", priority: "high" as const }] },
  { id: "done", title: "Done", color: "#22c55e", cards: [{ id: "4", title: "Task 4" }] },
];

export const Default: StoryObj = { render: () => <KanbanBoard columns={columns} /> };
export const WithCallbacks: StoryObj = { render: () => <KanbanBoard columns={columns} onCardClick={(card) => alert(card.title)} onAddCard={(colId) => alert(`Add to ${colId}`)} /> };
