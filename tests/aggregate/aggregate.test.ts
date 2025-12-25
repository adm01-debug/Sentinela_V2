import { AggregateRoot } from '../../aggregate';
class TestAggregate extends AggregateRoot {
  public value = 0;
  increment() { this.apply({ type: 'Incremented' }); }
  protected onEvent(event: any) { if (event.type === 'Incremented') this.value++; }
}
describe('AggregateRoot', () => {
  it('should apply events', () => {
    const agg = new TestAggregate('1');
    agg.increment();
    expect(agg.value).toBe(1);
    expect(agg.version).toBe(1);
  });
  it('should track uncommitted events', () => {
    const agg = new TestAggregate('1');
    agg.increment();
    expect(agg.getUncommittedEvents().length).toBe(1);
    agg.commit();
    expect(agg.getUncommittedEvents().length).toBe(0);
  });
});
