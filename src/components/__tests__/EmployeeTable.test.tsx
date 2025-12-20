import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmployeeTable } from '../employees/EmployeeTable';

const mockEmployees = [
  {
    id: 'emp-1',
    name: 'Maria Silva',
    email: 'maria@empresa.com',
    phone: '(11) 99999-1234',
    department: 'Vendas',
    position: 'Gerente',
    status: 'active',
    team_id: 'team-1',
    avatar_url: null,
    devices: [
      { id: 'dev-1', device_name: 'Desktop Principal', device_type: 'desktop', is_primary: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'emp-2',
    name: 'João Santos',
    email: 'joao@empresa.com',
    phone: null,
    department: 'TI',
    position: 'Desenvolvedor',
    status: 'inactive',
    team_id: null,
    avatar_url: null,
    devices: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockTeams = [
  { id: 'team-1', name: 'Equipe Comercial' },
  { id: 'team-2', name: 'Equipe Tech' },
];

describe('EmployeeTable', () => {
  const handlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onAssignDevice: vi.fn(),
    onUnassignDevice: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders employee list correctly', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        teams={mockTeams}
        {...handlers}
      />
    );

    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('João Santos')).toBeInTheDocument();
  });

  it('shows empty state when no employees', () => {
    render(
      <EmployeeTable
        employees={[]}
        teams={mockTeams}
        {...handlers}
      />
    );

    expect(screen.getByText('Nenhum funcionário encontrado')).toBeInTheDocument();
  });

  it('displays employee contact info', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        teams={mockTeams}
        {...handlers}
      />
    );

    expect(screen.getByText('maria@empresa.com')).toBeInTheDocument();
    expect(screen.getByText('(11) 99999-1234')).toBeInTheDocument();
  });

  it('shows department and position', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        teams={mockTeams}
        {...handlers}
      />
    );

    expect(screen.getByText('Vendas')).toBeInTheDocument();
    expect(screen.getByText('Gerente')).toBeInTheDocument();
  });

  it('displays team name for assigned employees', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        teams={mockTeams}
        {...handlers}
      />
    );

    expect(screen.getByText('Equipe Comercial')).toBeInTheDocument();
  });

  it('shows device badges', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        teams={mockTeams}
        {...handlers}
      />
    );

    expect(screen.getByText('Desktop Principal')).toBeInTheDocument();
  });

  it('shows "Nenhum" when no devices', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        teams={mockTeams}
        {...handlers}
      />
    );

    expect(screen.getByText('Nenhum')).toBeInTheDocument();
  });

  it('displays initials in avatar', () => {
    render(
      <EmployeeTable
        employees={mockEmployees}
        teams={mockTeams}
        {...handlers}
      />
    );

    expect(screen.getByText('MS')).toBeInTheDocument();
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <EmployeeTable
        employees={[mockEmployees[0]]}
        teams={mockTeams}
        {...handlers}
      />
    );

    const editButtons = screen.getAllByRole('button');
    // Find the edit button (has Edit icon)
    const editButton = editButtons.find(btn => btn.querySelector('[class*="h-4"]'));
    if (editButton) {
      fireEvent.click(editButton);
    }

    expect(handlers.onEdit).toHaveBeenCalled();
  });

  it('handles dash for missing team', () => {
    render(
      <EmployeeTable
        employees={[mockEmployees[1]]}
        teams={mockTeams}
        {...handlers}
      />
    );

    // Employee without team shows dash
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
