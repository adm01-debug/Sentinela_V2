import { AntiCorruptionLayer, Translator, Facade } from '../../antiCorruptionLayer';

interface ExternalUser { user_id: string; full_name: string; email_address: string; }
interface InternalUser { id: string; name: string; email: string; }

describe('AntiCorruptionLayer', () => {
  const translator: Translator<ExternalUser, InternalUser> = {
    toInternal: (ext) => ({ id: ext.user_id, name: ext.full_name, email: ext.email_address }),
    toExternal: (int) => ({ user_id: int.id, full_name: int.name, email_address: int.email })
  };

  it('should translate external to internal', () => {
    const external: ExternalUser = { user_id: '123', full_name: 'John Doe', email_address: 'j@d.com' };
    const internal = translator.toInternal(external);
    expect(internal.id).toBe('123');
    expect(internal.name).toBe('John Doe');
  });

  it('should translate internal to external', () => {
    const internal: InternalUser = { id: '456', name: 'Jane', email: 'jane@test.com' };
    const external = translator.toExternal(internal);
    expect(external.user_id).toBe('456');
  });
});
