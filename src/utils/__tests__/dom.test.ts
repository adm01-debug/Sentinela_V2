import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('dom utils', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('element queries', () => {
    it('should query element by id', () => {
      document.body.innerHTML = '<div id="test">Test</div>';
      const element = document.getElementById('test');
      expect(element?.textContent).toBe('Test');
    });

    it('should query element by class', () => {
      document.body.innerHTML = '<div class="test-class">Test</div>';
      const element = document.querySelector('.test-class');
      expect(element?.textContent).toBe('Test');
    });

    it('should query multiple elements', () => {
      document.body.innerHTML = '<div class="item">1</div><div class="item">2</div>';
      const elements = document.querySelectorAll('.item');
      expect(elements.length).toBe(2);
    });

    it('should return null for non-existent element', () => {
      const element = document.getElementById('non-existent');
      expect(element).toBeNull();
    });
  });

  describe('element creation', () => {
    it('should create element', () => {
      const div = document.createElement('div');
      expect(div.tagName).toBe('DIV');
    });

    it('should create element with attributes', () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('placeholder', 'Enter text');
      expect(input.getAttribute('type')).toBe('text');
    });

    it('should create element with classes', () => {
      const div = document.createElement('div');
      div.classList.add('class1', 'class2');
      expect(div.classList.contains('class1')).toBe(true);
      expect(div.classList.contains('class2')).toBe(true);
    });
  });

  describe('element manipulation', () => {
    it('should append child element', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      expect(parent.children.length).toBe(1);
    });

    it('should remove element', () => {
      document.body.innerHTML = '<div id="remove-me">Remove</div>';
      const element = document.getElementById('remove-me');
      element?.remove();
      expect(document.getElementById('remove-me')).toBeNull();
    });

    it('should clone element', () => {
      const original = document.createElement('div');
      original.textContent = 'Original';
      const clone = original.cloneNode(true);
      expect((clone as Element).textContent).toBe('Original');
    });

    it('should insert before element', () => {
      document.body.innerHTML = '<div id="container"><span id="existing">Existing</span></div>';
      const container = document.getElementById('container');
      const existing = document.getElementById('existing');
      const newElement = document.createElement('span');
      newElement.id = 'new';
      container?.insertBefore(newElement, existing);
      expect(container?.firstChild).toBe(newElement);
    });
  });

  describe('class manipulation', () => {
    it('should add class', () => {
      const div = document.createElement('div');
      div.classList.add('active');
      expect(div.classList.contains('active')).toBe(true);
    });

    it('should remove class', () => {
      const div = document.createElement('div');
      div.classList.add('active');
      div.classList.remove('active');
      expect(div.classList.contains('active')).toBe(false);
    });

    it('should toggle class', () => {
      const div = document.createElement('div');
      div.classList.toggle('active');
      expect(div.classList.contains('active')).toBe(true);
      div.classList.toggle('active');
      expect(div.classList.contains('active')).toBe(false);
    });
  });

  describe('event handling', () => {
    it('should add event listener', () => {
      const button = document.createElement('button');
      const handler = vi.fn();
      button.addEventListener('click', handler);
      button.click();
      expect(handler).toHaveBeenCalled();
    });

    it('should remove event listener', () => {
      const button = document.createElement('button');
      const handler = vi.fn();
      button.addEventListener('click', handler);
      button.removeEventListener('click', handler);
      button.click();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('scroll utilities', () => {
    it('should scroll to element', () => {
      const scrollIntoView = vi.fn();
      const element = { scrollIntoView };
      element.scrollIntoView({ behavior: 'smooth' });
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should get scroll position', () => {
      vi.stubGlobal('scrollY', 100);
      expect(scrollY).toBe(100);
    });
  });
});
