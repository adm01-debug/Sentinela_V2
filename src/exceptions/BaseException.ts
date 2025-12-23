export class BaseException extends Error {
  readonly code: number; readonly details?: any;
  constructor(message: string, code = 500, details?: any) { super(message); this.name = this.constructor.name; this.code = code; this.details = details; Error.captureStackTrace?.(this, this.constructor); }
  toJSON() { return { name: this.name, message: this.message, code: this.code, details: this.details }; }
}
