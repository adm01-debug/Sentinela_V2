/**
 * @fileoverview CQRS pattern example
 */

import { CommandBus, QueryBus, EventStore } from '@sentinela/core/cqrsAdvanced';

// Commands
interface CreateUserCommand { type: 'CreateUser'; name: string; email: string; }
interface UpdateUserCommand { type: 'UpdateUser'; id: string; name: string; }

// Queries
interface GetUserQuery { type: 'GetUser'; id: string; }
interface ListUsersQuery { type: 'ListUsers'; page: number; limit: number; }

// Setup
const commandBus = new CommandBus();
const queryBus = new QueryBus();
const eventStore = new EventStore();

// Register handlers
commandBus.register('CreateUser', {
  async execute(cmd: CreateUserCommand) {
    const userId = crypto.randomUUID();
    await eventStore.append(userId, [
      { type: 'UserCreated', data: { id: userId, ...cmd }, version: 1 }
    ]);
    return { id: userId };
  }
});

queryBus.register('GetUser', {
  async execute(query: GetUserQuery) {
    const events = await eventStore.load(query.id);
    return events.reduce((user, event) => {
      if (event.type === 'UserCreated') return { ...user, ...event.data };
      if (event.type === 'UserUpdated') return { ...user, ...event.data };
      return user;
    }, {});
  }
});

// Usage
async function main() {
  const result = await commandBus.execute({ type: 'CreateUser', name: 'John', email: 'j@t.com' });
  console.log('Created user:', result);
  
  const user = await queryBus.execute({ type: 'GetUser', id: result.id });
  console.log('User:', user);
}

main();
