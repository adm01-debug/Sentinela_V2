import { AggregateFactory, DomainEvent } from './types';
import { AggregateRoot } from './aggregateRoot';

export class GenericAggregateFactory<T extends AggregateRoot, C extends { id: string }> implements AggregateFactory<T, C> {
  constructor(private ctor: new (id: string) => T) {}
  
  create(command: C): T {
    return new this.ctor(command.id);
  }
  
  reconstitute(id: string, events: DomainEvent[]): T {
    const aggregate = new this.ctor(id);
    aggregate.loadFromHistory(events);
    return aggregate;
  }
}