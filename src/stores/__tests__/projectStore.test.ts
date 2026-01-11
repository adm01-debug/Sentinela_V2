// Project Store Tests for Sentinela v17
import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../projectStore';

describe('projectStore', () => {
  beforeEach(() => {
    useProjectStore.getState().reset();
  });

  it('should initialize with empty state', () => {
    const state = useProjectStore.getState();
    expect(state.projects).toEqual([]);
    expect(state.currentProject).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('should set projects', () => {
    const projects = [
      { id: '1', name: 'Project 1', status: 'active' },
      { id: '2', name: 'Project 2', status: 'completed' },
    ];
    useProjectStore.getState().setProjects(projects as any);
    expect(useProjectStore.getState().projects).toHaveLength(2);
  });

  it('should add a project', () => {
    const project = { id: '1', name: 'New Project', status: 'active' };
    useProjectStore.getState().addProject(project as any);
    expect(useProjectStore.getState().projects).toHaveLength(1);
  });

  it('should update a project', () => {
    const project = { id: '1', name: 'Project', status: 'active' };
    useProjectStore.getState().addProject(project as any);
    useProjectStore.getState().updateProject('1', { name: 'Updated Project' });
    expect(useProjectStore.getState().projects[0].name).toBe('Updated Project');
  });

  it('should remove a project', () => {
    const project = { id: '1', name: 'Project', status: 'active' };
    useProjectStore.getState().addProject(project as any);
    useProjectStore.getState().removeProject('1');
    expect(useProjectStore.getState().projects).toHaveLength(0);
  });

  it('should set current project', () => {
    const project = { id: '1', name: 'Project', status: 'active' };
    useProjectStore.getState().setCurrentProject(project as any);
    expect(useProjectStore.getState().currentProject?.id).toBe('1');
  });

  it('should set and clear filters', () => {
    useProjectStore.getState().setFilters({ status: 'active' } as any);
    expect(useProjectStore.getState().filters.status).toBe('active');
    useProjectStore.getState().clearFilters();
    expect(useProjectStore.getState().filters).toEqual({});
  });
});
