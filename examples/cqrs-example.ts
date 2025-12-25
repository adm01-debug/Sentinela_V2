/**
 * CQRS example
 */
import { CommandBus, QueryBus } from '../src/cqrsAdvanced';
const commands = new CommandBus();
const queries = new QueryBus();
commands.register('CreateUser', { execute: async (cmd: any) => ({ id: Date.now().toString(), ...cmd }) });
queries.register('GetUser', { execute: async (q: any) => ({ id: q.id, name: 'Test' }) });
async function main() {
  const user = await commands.execute({ type: 'CreateUser', name: 'Alice' });
  console.log('Created:', user);
  const found = await queries.execute({ type: 'GetUser', id: user.id });
  console.log('Found:', found);
}
