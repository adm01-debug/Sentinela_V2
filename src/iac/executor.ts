import { Stack, StackState, ResourceState } from './types';

export class StackExecutor {
  private states: Map<string, StackState> = new Map();
  
  async apply(stack: Stack): Promise<ApplyResult> {
    const results: ResourceState[] = [];
    const sorted = this.topologicalSort(stack);
    
    for (const resource of sorted) {
      console.log('Creating:', resource.type, resource.name);
      results.push({ name: resource.name, type: resource.type, status: 'created', physicalId: 'id-' + Date.now() });
    }
    
    const outputs: Record<string, string> = {};
    stack.outputs.forEach(o => { outputs[o.name] = o.value; });
    
    this.states.set(stack.name, { resources: results, outputs, lastApplied: new Date() });
    return { success: true, resources: results };
  }
  
  async destroy(stackName: string): Promise<void> {
    const state = this.states.get(stackName);
    if (state) {
      state.resources.reverse().forEach(r => console.log('Deleting:', r.name));
      this.states.delete(stackName);
    }
  }
  
  private topologicalSort(stack: Stack): Stack['resources'] {
    return [...stack.resources].sort((a, b) => (a.dependsOn?.length ?? 0) - (b.dependsOn?.length ?? 0));
  }
  
  getState(stackName: string): StackState | undefined { return this.states.get(stackName); }
}

export interface ApplyResult { success: boolean; resources: ResourceState[]; error?: string; }