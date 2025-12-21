import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar';

describe('Avatar', () => {
  it('should render avatar with image', () => {
    render(
      <Avatar>
        <AvatarImage src="test.jpg" alt="Test" />
        <AvatarFallback>TT</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('should show fallback when image fails', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <Avatar className="custom">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('AB').parentElement).toHaveClass('custom');
  });
});
