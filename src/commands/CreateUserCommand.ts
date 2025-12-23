export interface CreateUserCommandInput { email: string; name: string; password: string; role?: string; }
export class CreateUserCommand {
  constructor(public readonly input: CreateUserCommandInput) {}
  validate(): boolean { return !!this.input.email && !!this.input.name && !!this.input.password; }
}
export const createUserCommand = (input: CreateUserCommandInput) => new CreateUserCommand(input);
