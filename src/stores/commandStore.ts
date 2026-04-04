// Command Store for Sentinela v17 (Command Palette)
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string[];
  category?: string;
  keywords?: string[];
  action: () => void | Promise<void>;
  isDisabled?: boolean;
  isHidden?: boolean;
}

interface CommandGroup {
  id: string;
  label: string;
  commands: Command[];
  priority?: number;
}

interface CommandState {
  isOpen: boolean;
  query: string;
  groups: CommandGroup[];
  recentCommands: string[];
  selectedIndex: number;
  isLoading: boolean;

  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  registerGroup: (group: CommandGroup) => void;
  unregisterGroup: (groupId: string) => void;
  registerCommand: (groupId: string, command: Command) => void;
  unregisterCommand: (groupId: string, commandId: string) => void;
  executeCommand: (commandId: string) => Promise<void>;
  addToRecent: (commandId: string) => void;
  setSelectedIndex: (index) => void;
  selectNext: () => void;
  selectPrevious: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const MAX_RECENT = 5;

export const useCommandStore = create<CommandState>()(
  devtools(
    (set, get) => ({
      isOpen: false,
      query: '',
      groups: [],
      recentCommands: [],
      selectedIndex: 0,
      isLoading: false,

      open: () => set({ isOpen: true, query: '', selectedIndex: 0 }),

      close: () => set({ isOpen: false, query: '' }),

      toggle: () => set((state) => ({ isOpen: !state.isOpen, query: '', selectedIndex: 0 })),

      setQuery: (query) => set({ query, selectedIndex: 0 }),

      clearQuery: () => set({ query: '', selectedIndex: 0 }),

      registerGroup: (group) =>
        set((state) => ({
          groups: [...state.groups.filter((g) => g.id !== group.id), group]
            .sort((a, b) => (b.priority || 0) - (a.priority || 0)),
        })),

      unregisterGroup: (groupId) =>
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
        })),

      registerCommand: (groupId, command) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, commands: [...g.commands.filter((c) => c.id !== command.id), command] }
              : g
          ),
        })),

      unregisterCommand: (groupId, commandId) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, commands: g.commands.filter((c) => c.id !== commandId) }
              : g
          ),
        })),

      executeCommand: async (commandId) => {
        const { groups, addToRecent, close } = get();
        for (const group of groups) {
          const command = group.commands.find((c) => c.id === commandId);
          if (command && !command.isDisabled) {
            set({ isLoading: true });
            try {
              await command.action();
              addToRecent(commandId);
            } finally {
              set({ isLoading: false });
              close();
            }
            return;
          }
        }
      },

      addToRecent: (commandId) =>
        set((state) => ({
          recentCommands: [commandId, ...state.recentCommands.filter((id) => id !== commandId)].slice(0, MAX_RECENT),
        })),

      setSelectedIndex: (selectedIndex) => set({ selectedIndex }),

      selectNext: () =>
        set((state) => {
          const totalCommands = state.groups.reduce((acc, g) => acc + g.commands.length, 0);
          return { selectedIndex: (state.selectedIndex + 1) % totalCommands };
        }),

      selectPrevious: () =>
        set((state) => {
          const totalCommands = state.groups.reduce((acc, g) => acc + g.commands.length, 0);
          return { selectedIndex: (state.selectedIndex - 1 + totalCommands) % totalCommands };
        }),

      setLoading: (isLoading) => set({ isLoading }),

      reset: () => set({ isOpen: false, query: '', selectedIndex: 0, isLoading: false }),
    }),
    { name: 'CommandStore' }
  )
);

// Selector for filtered commands
export const selectFilteredCommands = (state: CommandState) => {
  const query = state.query.toLowerCase();
  if (!query) return state.groups;

  return state.groups
    .map((group) => ({
      ...group,
      commands: group.commands.filter(
        (cmd) =>
          !cmd.isHidden &&
          (cmd.label.toLowerCase().includes(query) ||
            cmd.description?.toLowerCase().includes(query) ||
            cmd.keywords?.some((k) => k.toLowerCase().includes(query)))
      ),
    }))
    .filter((group) => group.commands.length > 0);
};
