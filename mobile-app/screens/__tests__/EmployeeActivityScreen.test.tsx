import React from 'react';
import { render } from '@testing-library/react-native';
import { EmployeeActivityScreen } from '../EmployeeActivityScreen';

describe('EmployeeActivityScreen', () => {
  it('renders', () => {
    const { toJSON } = render(<EmployeeActivityScreen />);
    expect(toJSON()).toBeTruthy();
  });
});