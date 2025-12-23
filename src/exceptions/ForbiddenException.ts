import { BaseException } from './BaseException';
export class ForbiddenException extends BaseException { constructor(message = 'Access denied') { super(message, 403); } }
export class InsufficientPermissionsException extends ForbiddenException { constructor(permission: string) { super('Missing permission: ' + permission); } }
export class ResourceOwnershipException extends ForbiddenException { constructor() { super('You do not own this resource'); } }
