import React from 'react';
import { render } from '@testing-library/react-native';
import { DataTable } from '../DataTable';

describe('DataTable', () => {
  it('renders', () => {
    const { toJSON } = render(<DataTable />);
    expect(toJSON()).toBeTruthy();
  });
});