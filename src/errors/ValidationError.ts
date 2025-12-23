export class ValidationError extends Error {
  constructor(public field: string, message: string, public errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ValidationError';
  }

  static fromZodError(error: any) {
    const errors: Record<string, string[]> = {};
    error.errors?.forEach((e: any) => {
      const path = e.path.join('.');
      errors[path] = errors[path] || [];
      errors[path].push(e.message);
    });
    return new ValidationError('validation', 'Validation failed', errors);
  }
}
