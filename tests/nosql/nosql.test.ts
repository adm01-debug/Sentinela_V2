import { NoSQLAdapter, Collection, Document } from '../../nosql';
describe('NoSQLAdapter', () => {
  let adapter: NoSQLAdapter;
  beforeEach(() => { adapter = new NoSQLAdapter({ type: 'mongodb' }); });
  it('should insert document', async () => {
    const doc = await adapter.insert('users', { name: 'John', age: 30 });
    expect(doc._id).toBeDefined();
  });
  it('should find documents', async () => {
    await adapter.insert('users', { name: 'Alice', age: 25 });
    await adapter.insert('users', { name: 'Bob', age: 35 });
    const docs = await adapter.find('users', { age: { $gt: 20 } });
    expect(docs.length).toBe(2);
  });
  it('should find one document', async () => {
    await adapter.insert('users', { name: 'Charlie' });
    const doc = await adapter.findOne('users', { name: 'Charlie' });
    expect(doc.name).toBe('Charlie');
  });
  it('should update documents', async () => {
    const inserted = await adapter.insert('users', { name: 'Dan', age: 40 });
    await adapter.update('users', { _id: inserted._id }, { $set: { age: 41 } });
    const updated = await adapter.findOne('users', { _id: inserted._id });
    expect(updated.age).toBe(41);
  });
  it('should delete documents', async () => {
    const inserted = await adapter.insert('users', { name: 'Eve' });
    await adapter.delete('users', { _id: inserted._id });
    const doc = await adapter.findOne('users', { _id: inserted._id });
    expect(doc).toBeNull();
  });
});