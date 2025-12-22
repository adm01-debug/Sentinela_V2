import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('renders', () => {
    const { toJSON } = render(<Avatar />);
    expect(toJSON()).toBeTruthy();
  });
});