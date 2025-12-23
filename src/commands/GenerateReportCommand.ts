export interface GenerateReportCommandInput { type: string; startDate: string; endDate: string; employeeIds?: string[]; }
export class GenerateReportCommand {
  constructor(public readonly input: GenerateReportCommandInput) {}
  validate(): boolean { return !!this.input.type && !!this.input.startDate && !!this.input.endDate; }
}
export const generateReportCommand = (input: GenerateReportCommandInput) => new GenerateReportCommand(input);
