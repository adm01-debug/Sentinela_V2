import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SchedulesList } from '../schedules/SchedulesList';

vi.mock('@/hooks/useWorkSchedulesPage', () => ({
  formatWorkDays: (days: number[]) => {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days.map(d => dayNames[d]).join(', ');
  },
  calculateWorkHours: (start: string, end: string, breakStart?: string, breakEnd?: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let hours = (endH + endM / 60) - (startH + startM / 60);
    if (breakStart && breakEnd) {
      const [bStartH, bStartM] = breakStart.split(':').map(Number);
      const [bEndH, bEndM] = breakEnd.split(':').map(Number);
      hours -= (bEndH + bEndM / 60) - (bStartH + bStartM / 60);
    }
    return hours;
  },
}));

const mockSchedules = [
  {
    id: 'sched-1',
    name: 'Horário Comercial',
    description: 'Horário padrão de trabalho',
    start_time: '08:00',
    end_time: '17:00',
    break_start: '12:00',
    break_end: '13:00',
    work_days: [1, 2, 3, 4, 5],
    flexible_start: true,
    flexible_minutes: 15,
    overtime_allowed: true,
    block_outside_hours: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sched-2',
    name: 'Plantão',
    description: null,
    start_time: '07:00',
    end_time: '19:00',
    break_start: null,
    break_end: null,
    work_days: [0, 6],
    flexible_start: false,
    flexible_minutes: 0,
    overtime_allowed: false,
    block_outside_hours: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

describe('SchedulesList', () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders schedules correctly', () => {
    render(
      <SchedulesList
        schedules={mockSchedules}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Horário Comercial')).toBeInTheDocument();
    expect(screen.getByText('Plantão')).toBeInTheDocument();
  });

  it('shows empty state when no schedules', () => {
    render(
      <SchedulesList
        schedules={[]}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Nenhum horário cadastrado')).toBeInTheDocument();
  });

  it('displays work hours', () => {
    render(
      <SchedulesList
        schedules={mockSchedules}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('08:00 - 17:00')).toBeInTheDocument();
    expect(screen.getByText('07:00 - 19:00')).toBeInTheDocument();
  });

  it('shows break time when available', () => {
    render(
      <SchedulesList
        schedules={mockSchedules}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText(/Intervalo: 12:00 - 13:00/)).toBeInTheDocument();
  });

  it('displays flexible badge when applicable', () => {
    render(
      <SchedulesList
        schedules={mockSchedules}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText(/Flexível ±15min/)).toBeInTheDocument();
  });

  it('shows overtime allowed badge', () => {
    render(
      <SchedulesList
        schedules={mockSchedules}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('HE Permitida')).toBeInTheDocument();
  });

  it('shows block badge correctly', () => {
    render(
      <SchedulesList
        schedules={mockSchedules}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Bloqueio Ativo')).toBeInTheDocument();
    expect(screen.getByText('Sem Bloqueio')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <SchedulesList
        schedules={[mockSchedules[0]]}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // First button is edit

    expect(onEdit).toHaveBeenCalledWith(mockSchedules[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <SchedulesList
        schedules={[mockSchedules[0]]}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // Second button is delete

    expect(onDelete).toHaveBeenCalledWith(mockSchedules[0]);
  });

  it('shows description when available', () => {
    render(
      <SchedulesList
        schedules={mockSchedules}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Horário padrão de trabalho')).toBeInTheDocument();
  });
});
