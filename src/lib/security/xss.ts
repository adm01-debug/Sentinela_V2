const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'form'];
const DANGEROUS_ATTRS = ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus'];

export function sanitizeHTML(input: string): string {
  let sanitized = input;
  DANGEROUS_TAGS.forEach(tag => {
    sanitized = sanitized.replace(new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi'), '');
    sanitized = sanitized.replace(new RegExp(`<${tag}[^>]*>`, 'gi'), '');
  });
  DANGEROUS_ATTRS.forEach(attr => {
    sanitized = sanitized.replace(new RegExp(`${attr}\s*=\s*["'][^"']*["']`, 'gi'), '');
  });
  return sanitized;
}

export function escapeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizeInput(input: string): string {
  return escapeHTML(input.trim());
}
