import React from 'react';
import { render } from '@testing-library/react-native';
import { EmployeeDetailScreen } from '../EmployeeDetailScreen';

describe('EmployeeDetailScreen', () => {
  it('renders', () => {
    const { toJSON } = render(<EmployeeDetailScreen />);
    expect(toJSON()).toBeTruthy();
  });
});