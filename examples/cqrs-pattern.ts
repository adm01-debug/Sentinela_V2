/**
 * @fileoverview CQRS pattern example
 */

import { CommandBus, QueryBus, EventStore } from '@sentinela/core/cqrsAdvanced';

// Domain Events
interface UserCreated {
  type: 'UserCreated';
  userId: string;
  name: string;
  email: string;
  timestamp: Date;
}

// Commands
interface CreateUserCommand {
  type: 'CreateUser';
  name: string;
  email: string;
}

// Queries
interface GetUserQuery {
  type: 'GetUser';
  userId: string;
}

// Read Model
interface UserReadModel {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// In-memory store for demo
const users = new Map<string, UserReadModel>();

// Setup
const commandBus = new CommandBus();
const queryBus = new QueryBus();
const eventStore = new EventStore();

// Register Command Handlers
commandBus.register('CreateUser', {
  async execute(command: CreateUserCommand) {
    const userId = crypto.randomUUID();
    
    // Store event
    await eventStore.append({
      streamId: `user-${userId}`,
      event: {
        type: 'UserCreated',
        userId,
        name: command.name,
        email: command.email,
        timestamp: new Date()
      }
    });
    
    // Update read model
    users.set(userId, {
      id: userId,
      name: command.name,
      email: command.email,
      createdAt: new Date()
    });
    
    return { userId };
  }
});

// Register Query Handlers
queryBus.register('GetUser', {
  async execute(query: GetUserQuery) {
    return users.get(query.userId) || null;
  }
});

// Usage
async function main() {
  // Create a user
  const result = await commandBus.execute<CreateUserCommand, { userId: string }>({
    type: 'CreateUser',
    name: 'John Doe',
    email: 'john@example.com'
  });
  
  console.log('User created:', result.userId);
  
  // Query the user
  const user = await queryBus.execute<GetUserQuery, UserReadModel | null>({
    type: 'GetUser',
    userId: result.userId
  });
  
  console.log('User retrieved:', user);
}

main();
