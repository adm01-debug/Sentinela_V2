import { render, screen } from '@testing-library/react';
import { ChartContainer, ChartTooltip, ChartLegend } from '../chart';

describe('Chart', () => {
  it('should render chart container', () => {
    render(
      <ChartContainer config={{}}>
        <div data-testid="chart-content">Chart</div>
      </ChartContainer>
    );
    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <ChartContainer config={{}} className="custom">
        <div>Chart</div>
      </ChartContainer>
    );
    expect(screen.getByText('Chart').parentElement).toHaveClass('custom');
  });

  it('should render with config', () => {
    const config = { line1: { label: 'Line 1', color: '#000' } };
    render(
      <ChartContainer config={config}>
        <div>Chart</div>
      </ChartContainer>
    );
    expect(screen.getByText('Chart')).toBeInTheDocument();
  });
});
