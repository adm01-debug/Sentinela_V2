import { BaseException } from './BaseException';
export class AuthException extends BaseException { constructor(message = 'Authentication required') { super(message, 401); } }
export class InvalidCredentialsException extends AuthException { constructor() { super('Invalid email or password'); } }
export class TokenExpiredException extends AuthException { constructor() { super('Token expired'); } }
export class SessionExpiredException extends AuthException { constructor() { super('Session expired'); } }
