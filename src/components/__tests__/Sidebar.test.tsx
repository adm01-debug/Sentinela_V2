import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';

// Wrapper with Router
const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

describe('Sidebar', () => {
  describe('rendering', () => {
    it('should render the logo and title', () => {
      renderWithRouter(<Sidebar />);
      
      expect(screen.getByText('Sentinela')).toBeInTheDocument();
    });

    it('should render all navigation groups', () => {
      renderWithRouter(<Sidebar />);
      
      expect(screen.getByText('Principal')).toBeInTheDocument();
      expect(screen.getByText('Monitoramento')).toBeInTheDocument();
      expect(screen.getByText('Configurações')).toBeInTheDocument();
      expect(screen.getByText('Relatórios')).toBeInTheDocument();
      expect(screen.getByText('Políticas')).toBeInTheDocument();
      expect(screen.getByText('Sistema')).toBeInTheDocument();
    });

    it('should render navigation items', () => {
      renderWithRouter(<Sidebar />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Funcionários')).toBeInTheDocument();
      expect(screen.getByText('Equipes')).toBeInTheDocument();
      expect(screen.getByText('Dispositivos')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should have correct link for Dashboard', () => {
      renderWithRouter(<Sidebar />);
      
      const dashboardLink = screen.getByRole('menuitem', { name: /Dashboard/i });
      expect(dashboardLink).toHaveAttribute('href', '/');
    });

    it('should have correct link for Employees', () => {
      renderWithRouter(<Sidebar />);
      
      const employeesLink = screen.getByRole('menuitem', { name: /Funcionários/i });
      expect(employeesLink).toHaveAttribute('href', '/employees');
    });

    it('should highlight active route', () => {
      renderWithRouter(<Sidebar />, { route: '/' });
      
      const dashboardLink = screen.getByRole('menuitem', { name: /Dashboard/i });
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('collapse functionality', () => {
    it('should toggle collapse when button is clicked', () => {
      renderWithRouter(<Sidebar />);
      
      const toggleButton = screen.getByRole('button', { name: /Recolher menu/i });
      expect(toggleButton).toBeInTheDocument();
      
      fireEvent.click(toggleButton);
      
      expect(screen.getByRole('button', { name: /Expandir menu/i })).toBeInTheDocument();
    });

    it('should hide text labels when collapsed', () => {
      renderWithRouter(<Sidebar />);
      
      // Initially visible
      expect(screen.getByText('Sentinela')).toBeVisible();
      
      // Collapse
      const toggleButton = screen.getByRole('button', { name: /Recolher menu/i });
      fireEvent.click(toggleButton);
      
      // Logo text should not be visible (component structure changes)
      expect(screen.queryByText('Sentinela')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have navigation role', () => {
      renderWithRouter(<Sidebar />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have aria-label for navigation', () => {
      renderWithRouter(<Sidebar />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Menu principal');
    });

    it('should have menubar role for nav items', () => {
      renderWithRouter(<Sidebar />);
      
      expect(screen.getByRole('menubar')).toBeInTheDocument();
    });

    it('should have menuitem roles for links', () => {
      renderWithRouter(<Sidebar />);
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('should have sr-only text when collapsed', () => {
      renderWithRouter(<Sidebar />);
      
      // Collapse
      const toggleButton = screen.getByRole('button', { name: /Recolher menu/i });
      fireEvent.click(toggleButton);
      
      // Screen reader text should exist
      const srOnlyElements = document.querySelectorAll('.sr-only');
      expect(srOnlyElements.length).toBeGreaterThan(0);
    });

    it('toggle button should have aria-expanded', () => {
      renderWithRouter(<Sidebar />);
      
      const toggleButton = screen.getByRole('button', { name: /Recolher menu/i });
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      
      fireEvent.click(toggleButton);
      
      const expandButton = screen.getByRole('button', { name: /Expandir menu/i });
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('keyboard navigation', () => {
    it('should support arrow key navigation', () => {
      renderWithRouter(<Sidebar />);
      
      const firstItem = screen.getByRole('menuitem', { name: /Dashboard/i });
      firstItem.focus();
      
      // Simulate arrow down
      fireEvent.keyDown(firstItem, { key: 'ArrowDown' });
      
      // Focus should move to next item (handled by component)
      expect(document.activeElement).not.toBe(firstItem);
    });
  });
});
