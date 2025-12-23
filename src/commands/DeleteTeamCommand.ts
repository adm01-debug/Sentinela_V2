export interface DeleteTeamCommandInput { id: string; force?: boolean; }
export class DeleteTeamCommand {
  constructor(public readonly input: DeleteTeamCommandInput) {}
  validate(): boolean { return !!this.input.id; }
}
export const deleteTeamCommand = (input: DeleteTeamCommandInput) => new DeleteTeamCommand(input);
