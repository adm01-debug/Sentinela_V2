// DOM utilities for Sentinela v17

export function $(selector: string, parent: ParentNode = document): Element | null {
  return parent.querySelector(selector);
}

export function $$(selector: string, parent: ParentNode = document): Element[] {
  return Array.from(parent.querySelectorAll(selector));
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  children?: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  if (children) children.forEach((c) => el.append(c));
  return el;
}

export function addClass(element: Element, ...classNames: string[]): void {
  element.classList.add(...classNames);
}

export function removeClass(element: Element, ...classNames: string[]): void {
  element.classList.remove(...classNames);
}

export function toggleClass(element: Element, className: string, force?: boolean): boolean {
  return element.classList.toggle(className, force);
}

export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

export function getElement<T extends HTMLElement = HTMLElement>(id): T | null {
  return document.getElementById(id) as T | null;
}

export function getRect(element: Element): DOMRect {
  return element.getBoundingClientRect();
}

export function isInViewport(element: Element): boolean {
  const rect = getRect(element);
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export function getOffset(element: HTMLElement): { top: number; left: number } {
  let top = 0,
    left = 0,
    el: HTMLElement | null = element;
  while (el) {
    top += el.offsetTop - el.scrollTop + el.clientTop;
    left += el.offsetLeft - el.scrollLeft + el.clientLeft;
    el = el.offsetParent as HTMLElement | null;
  }
  return { top, left };
}

export function setStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(element.style, styles);
}

export function getComputedStyle(element: Element, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property);
}

export function show(element: HTMLElement): void {
  element.style.display = "";
}

export function hide(element: HTMLElement): void {
  element.style.display = "none";
}

export function isHidden(element: HTMLElement): boolean {
  return element.offsetParent === null;
}

export function insertAfter(newNode: Node, referenceNode: Node): void {
  referenceNode.parentNode?.insertBefore(newNode, referenceNode.nextSibling);
}

export function insertBefore(newNode: Node, referenceNode: Node): void {
  referenceNode.parentNode?.insertBefore(newNode, referenceNode);
}

export function removeElement(element: Element): void {
  element.remove();
}

export function emptyElement(element: Element): void {
  while (element.firstChild) element.removeChild(element.firstChild);
}

export function replaceElement(oldElement: Element, newElement: Element): void {
  oldElement.replaceWith(newElement);
}

export function getParents(element: Element, selector?: string): Element[] {
  const parents: Element[] = [];
  let el: Element | null = element.parentElement;
  while (el) {
    if (!selector || el.matches(selector)) parents.push(el);
    el = el.parentElement;
  }
  return parents;
}

export function getClosest(element: Element, selector: string): Element | null {
  return element.closest(selector);
}

export function getSiblings(element: Element): Element[] {
  return element.parentElement
    ? Array.from(element.parentElement.children).filter((c) => c !== element)
    : [];
}

export function getIndex(element: Element): number {
  return element.parentElement ? Array.from(element.parentElement.children).indexOf(element) : -1;
}

export function ready(callback: () => void): void {
  if (document.readyState !== "loading") callback();
  else document.addEventListener("DOMContentLoaded", callback);
}
