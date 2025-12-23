export interface UpdateEmployeeCommandInput { id: string; data: { name?: string; email?: string; department?: string; status?: string; }; }
export class UpdateEmployeeCommand {
  constructor(public readonly input: UpdateEmployeeCommandInput) {}
  validate(): boolean { return !!this.input.id && Object.keys(this.input.data).length > 0; }
}
export const updateEmployeeCommand = (input: UpdateEmployeeCommandInput) => new UpdateEmployeeCommand(input);
