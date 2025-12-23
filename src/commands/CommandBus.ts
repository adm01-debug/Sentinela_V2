type CommandHandler<T, R> = (command: T) => Promise<R>;
export class CommandBus {
  private handlers = new Map<string, CommandHandler<any, any>>();
  register<T, R>(commandName: string, handler: CommandHandler<T, R>) { this.handlers.set(commandName, handler); }
  async dispatch<T, R>(commandName: string, command: T): Promise<R> { const handler = this.handlers.get(commandName); if (!handler) throw new Error('Handler not found: ' + commandName); return handler(command); }
}
export const commandBus = new CommandBus();
