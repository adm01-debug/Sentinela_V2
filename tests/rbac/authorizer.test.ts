import { RBACAuthorizer, RoleManager, BindingManager } from '../../src/rbac';

describe('RBACAuthorizer', () => {
  let roleManager: RoleManager;
  let bindingManager: BindingManager;
  let authorizer: RBACAuthorizer;

  beforeEach(() => {
    roleManager = new RoleManager();
    bindingManager = new BindingManager();
    authorizer = new RBACAuthorizer(roleManager, bindingManager);

    // Setup roles
    roleManager.createClusterRole({
      name: 'admin',
      rules: [{ apiGroups: ['*'], resources: ['*'], verbs: ['*'] }]
    });

    roleManager.createClusterRole({
      name: 'viewer',
      rules: [{ apiGroups: ['*'], resources: ['pods'], verbs: ['get', 'list'] }]
    });

    // Setup bindings
    bindingManager.createClusterRoleBinding({
      name: 'admin-binding',
      roleRef: { apiGroup: 'rbac', kind: 'ClusterRole', name: 'admin' },
      subjects: [{ kind: 'User', name: 'admin-user' }]
    });

    bindingManager.createClusterRoleBinding({
      name: 'viewer-binding',
      roleRef: { apiGroup: 'rbac', kind: 'ClusterRole', name: 'viewer' },
      subjects: [{ kind: 'User', name: 'viewer-user' }]
    });
  });

  it('should allow admin all access', () => {
    const result = authorizer.authorize(
      { kind: 'User', name: 'admin-user' },
      'delete',
      'pods'
    );
    expect(result.allowed).toBe(true);
  });

  it('should allow viewer read access', () => {
    const result = authorizer.authorize(
      { kind: 'User', name: 'viewer-user' },
      'get',
      'pods'
    );
    expect(result.allowed).toBe(true);
  });

  it('should deny viewer write access', () => {
    const result = authorizer.authorize(
      { kind: 'User', name: 'viewer-user' },
      'delete',
      'pods'
    );
    expect(result.allowed).toBe(false);
  });

  it('should deny unknown user', () => {
    const result = authorizer.authorize(
      { kind: 'User', name: 'unknown' },
      'get',
      'pods'
    );
    expect(result.allowed).toBe(false);
  });
});
