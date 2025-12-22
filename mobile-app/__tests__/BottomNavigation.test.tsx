import React from 'react';
import { render } from '@testing-library/react-native';
import { BottomNavigation } from '../BottomNavigation';

describe('BottomNavigation', () => {
  it('renders', () => {
    const { toJSON } = render(<BottomNavigation />);
    expect(toJSON()).toBeTruthy();
  });
});