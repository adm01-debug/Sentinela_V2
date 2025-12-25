/**
 * Event-Driven Architecture Example
 * 
 * Demonstrates:
 * - Event Store
 * - Domain Events
 * - Event Sourcing
 * - Projections
 */

import {
  EventStore,
  DomainEventDispatcher,
  createLogger
} from '@sentinela/core';

const logger = createLogger('events-example');

// Domain Events
interface AccountCreated {
  type: 'AccountCreated';
  accountId: string;
  owner: string;
  timestamp: Date;
}

interface MoneyDeposited {
  type: 'MoneyDeposited';
  accountId: string;
  amount: number;
  timestamp: Date;
}

interface MoneyWithdrawn {
  type: 'MoneyWithdrawn';
  accountId: string;
  amount: number;
  timestamp: Date;
}

type AccountEvent = AccountCreated | MoneyDeposited | MoneyWithdrawn;

// Event Store
const eventStore = new EventStore<AccountEvent>();

// Event Dispatcher
const dispatcher = new DomainEventDispatcher();

// Read Model (Projection)
const accountBalances = new Map<string, number>();

// Event Handlers
dispatcher.register('AccountCreated', {
  async handle(event: AccountCreated) {
    accountBalances.set(event.accountId, 0);
    logger.info('Account created', { accountId: event.accountId });
  }
});

dispatcher.register('MoneyDeposited', {
  async handle(event: MoneyDeposited) {
    const current = accountBalances.get(event.accountId) || 0;
    accountBalances.set(event.accountId, current + event.amount);
    logger.info('Money deposited', { accountId: event.accountId, amount: event.amount });
  }
});

dispatcher.register('MoneyWithdrawn', {
  async handle(event: MoneyWithdrawn) {
    const current = accountBalances.get(event.accountId) || 0;
    accountBalances.set(event.accountId, current - event.amount);
    logger.info('Money withdrawn', { accountId: event.accountId, amount: event.amount });
  }
});

// Commands
async function createAccount(accountId: string, owner: string): Promise<void> {
  const event: AccountCreated = {
    type: 'AccountCreated',
    accountId,
    owner,
    timestamp: new Date()
  };
  
  await eventStore.append(accountId, [event]);
  await dispatcher.dispatch(event);
}

async function deposit(accountId: string, amount: number): Promise<void> {
  const event: MoneyDeposited = {
    type: 'MoneyDeposited',
    accountId,
    amount,
    timestamp: new Date()
  };
  
  await eventStore.append(accountId, [event]);
  await dispatcher.dispatch(event);
}

async function withdraw(accountId: string, amount: number): Promise<void> {
  const balance = accountBalances.get(accountId) || 0;
  if (balance < amount) {
    throw new Error('Insufficient funds');
  }
  
  const event: MoneyWithdrawn = {
    type: 'MoneyWithdrawn',
    accountId,
    amount,
    timestamp: new Date()
  };
  
  await eventStore.append(accountId, [event]);
  await dispatcher.dispatch(event);
}

// Main
async function main() {
  await createAccount('acc-1', 'John Doe');
  await deposit('acc-1', 1000);
  await deposit('acc-1', 500);
  await withdraw('acc-1', 200);
  
  logger.info('Final balance:', { balance: accountBalances.get('acc-1') });
  
  const events = await eventStore.getEvents('acc-1');
  logger.info('Event history:', { count: events.length });
}

main();
