import { createTranslator, ACLGateway } from '../../antiCorruptionLayer';
describe('ACL', () => {
  it('should translate between models', () => {
    const translator = createTranslator(
      (ext: { external_id: string }) => ({ id: ext.external_id }),
      (int: { id: string }) => ({ external_id: int.id })
    );
    expect(translator.toInternal({ external_id: '123' })).toEqual({ id: '123' });
    expect(translator.toExternal({ id: '123' })).toEqual({ external_id: '123' });
  });
});
