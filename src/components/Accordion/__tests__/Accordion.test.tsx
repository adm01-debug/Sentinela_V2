import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Accordion, AccordionItem } from '../Accordion';

describe('Accordion', () => {
  it('renders items', () => {
    render(
      <Accordion>
        <AccordionItem title="Section 1">Content 1</AccordionItem>
        <AccordionItem title="Section 2">Content 2</AccordionItem>
      </Accordion>
    );
    expect(screen.getByText('Section 1')).toBeInTheDocument();
  });

  it('expands on click', () => {
    render(
      <Accordion>
        <AccordionItem title="Section">Hidden content</AccordionItem>
      </Accordion>
    );
    fireEvent.click(screen.getByText('Section'));
    expect(screen.getByText('Hidden content')).toBeVisible();
  });

  it('collapses other items by default', () => {
    render(
      <Accordion>
        <AccordionItem title="S1">C1</AccordionItem>
        <AccordionItem title="S2">C2</AccordionItem>
      </Accordion>
    );
    fireEvent.click(screen.getByText('S1'));
    fireEvent.click(screen.getByText('S2'));
    expect(screen.queryByText('C1')).not.toBeVisible();
  });

  it('supports multiple open items', () => {
    render(
      <Accordion multiple>
        <AccordionItem title="S1">C1</AccordionItem>
        <AccordionItem title="S2">C2</AccordionItem>
      </Accordion>
    );
    fireEvent.click(screen.getByText('S1'));
    fireEvent.click(screen.getByText('S2'));
    expect(screen.getByText('C1')).toBeVisible();
    expect(screen.getByText('C2')).toBeVisible();
  });
});