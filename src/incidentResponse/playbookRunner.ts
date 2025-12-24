export interface PlaybookStep { name: string; action: () => Promise<boolean>; rollback?: () => Promise<void>; timeout?: number; }
export interface Playbook { id: string; name: string; steps: PlaybookStep[]; }
export interface PlaybookResult { playbook: Playbook; success: boolean; stepsExecuted: number; failedStep?: string; duration: number; }
export class PlaybookRunner {
  private playbooks = new Map<string, Playbook>();
  register(playbook: Playbook): void { this.playbooks.set(playbook.id, playbook); }
  async run(id: string): Promise<PlaybookResult> { const playbook = this.playbooks.get(id); if (!playbook) throw new Error('Playbook not found'); const start = Date.now(); let executed = 0; for (const step of playbook.steps) { try { const success = await step.action(); if (!success) throw new Error('Step failed'); executed++; } catch { return { playbook, success: false, stepsExecuted: executed, failedStep: step.name, duration: Date.now() - start }; } } return { playbook, success: true, stepsExecuted: executed, duration: Date.now() - start }; }
  get(id: string): Playbook | undefined { return this.playbooks.get(id); }
}
export const playbookRunner = new PlaybookRunner();
