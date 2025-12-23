import { BaseException } from './BaseException';
export class NotFoundException extends BaseException {
  constructor(resource: string, id?: string) { super(id ? resource + ' with id ' + id + ' not found' : resource + ' not found', 404); }
}
export class UserNotFoundException extends NotFoundException { constructor(id?: string) { super('User', id); } }
export class EmployeeNotFoundException extends NotFoundException { constructor(id?: string) { super('Employee', id); } }
export class TeamNotFoundException extends NotFoundException { constructor(id?: string) { super('Team', id); } }
