import React from 'react';
import { render } from '@testing-library/react-native';
import { Calendar } from '../Calendar';

describe('Calendar', () => {
  it('renders', () => {
    const { toJSON } = render(<Calendar />);
    expect(toJSON()).toBeTruthy();
  });
});