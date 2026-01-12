import { describe, it, expect } from 'vitest';
import { getFileExtension, getFileName, formatFileSize, getMimeType, isImageFile } from '../file';

describe('file utilities', () => {
  it('should get file extension', () => {
    expect(getFileExtension('doc.pdf')).toBe('pdf');
    expect(getFileExtension('image.PNG')).toBe('png');
  });

  it('should get file name without extension', () => {
    expect(getFileName('document.pdf')).toBe('document');
  });

  it('should format file size', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
  });

  it('should get mime type', () => {
    expect(getMimeType('file.pdf')).toBe('application/pdf');
    expect(getMimeType('image.jpg')).toBe('image/jpeg');
  });

  it('should detect image files', () => {
    expect(isImageFile('photo.jpg')).toBe(true);
    expect(isImageFile('doc.pdf')).toBe(false);
  });
});
