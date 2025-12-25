import { Translator, ACLFacade, ExternalSystemAdapter } from '../../antiCorruptionLayer';

interface InternalUser {
  id: string;
  fullName: string;
  emailAddress: string;
}

interface ExternalUser {
  userId: number;
  name: string;
  email: string;
}

class UserTranslator extends Translator<InternalUser, ExternalUser> {
  toDomain(external: ExternalUser): InternalUser {
    return {
      id: String(external.userId),
      fullName: external.name,
      emailAddress: external.email
    };
  }

  toExternal(internal: InternalUser): ExternalUser {
    return {
      userId: parseInt(internal.id),
      name: internal.fullName,
      email: internal.emailAddress
    };
  }
}

describe('Translator', () => {
  let translator: UserTranslator;

  beforeEach(() => {
    translator = new UserTranslator();
  });

  it('should translate to domain', () => {
    const external: ExternalUser = { userId: 123, name: 'John Doe', email: 'john@test.com' };
    const internal = translator.toDomain(external);

    expect(internal.id).toBe('123');
    expect(internal.fullName).toBe('John Doe');
  });

  it('should translate to external', () => {
    const internal: InternalUser = { id: '456', fullName: 'Jane', emailAddress: 'jane@test.com' };
    const external = translator.toExternal(internal);

    expect(external.userId).toBe(456);
    expect(external.name).toBe('Jane');
  });
});

describe('ACLFacade', () => {
  it('should wrap external system calls', async () => {
    const externalApi = { getUser: jest.fn().mockResolvedValue({ userId: 1, name: 'Test', email: 't@t.com' }) };
    const translator = new UserTranslator();
    const facade = new ACLFacade(externalApi, translator);

    const user = await facade.getUser(1);
    expect(user.fullName).toBe('Test');
  });
});
