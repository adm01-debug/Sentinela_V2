export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(response: Response, message?: string) {
    return new ApiError(response.status, message || response.statusText);
  }
}
