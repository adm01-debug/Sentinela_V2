import React from 'react';
import { render } from '@testing-library/react-native';
import { EmployeesScreen } from '../EmployeesScreen';

describe('EmployeesScreen', () => {
  it('renders', () => {
    const { toJSON } = render(<EmployeesScreen />);
    expect(toJSON()).toBeTruthy();
  });
});