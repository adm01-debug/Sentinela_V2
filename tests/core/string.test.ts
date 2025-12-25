import { capitalize, camelCase, snakeCase, slugify, truncate } from '../../core/string';
describe('String', () => {
  it('should capitalize', () => { expect(capitalize('hello')).toBe('Hello'); });
  it('should camelCase', () => { expect(camelCase('hello-world')).toBe('helloWorld'); });
  it('should snakeCase', () => { expect(snakeCase('helloWorld')).toBe('hello_world'); });
  it('should slugify', () => { expect(slugify('Hello World!')).toBe('hello-world'); });
  it('should truncate', () => { expect(truncate('hello world', 5)).toBe('hello...'); });
});
