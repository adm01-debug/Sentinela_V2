import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DataTable } from '../components/DataTable';

describe('DataTable', () => {
  const columns = [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }];
  const data = [{ id: '1', name: 'John', email: 'john@test.com' }];
  
  it('renders table headers', () => { render(<BrowserRouter><DataTable columns={columns} data={data} /></BrowserRouter>); expect(screen.getByText('Name')).toBeInTheDocument(); });
  it('renders data rows', () => { render(<BrowserRouter><DataTable columns={columns} data={data} /></BrowserRouter>); expect(screen.getByText('John')).toBeInTheDocument(); });
  it('shows skeleton on loading', () => { render(<BrowserRouter><DataTable columns={columns} data={[]} isLoading /></BrowserRouter>); expect(screen.queryByText('John')).not.toBeInTheDocument(); });
});