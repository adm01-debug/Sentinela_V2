import { BaseException } from './BaseException';
export class ConflictException extends BaseException { constructor(message: string) { super(message, 409); } }
export class DuplicateEmailException extends ConflictException { constructor() { super('Email already in use'); } }
export class DuplicateResourceException extends ConflictException { constructor(resource: string) { super(resource + ' already exists'); } }
