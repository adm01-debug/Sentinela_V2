export class PermissionError extends Error {
  constructor(action: string, resource?: string) {
    super('Sem permissão para ' + action + (resource ? ' ' + resource : ''));
    this.name = 'PermissionError';
  }

  static cannotRead(resource: string) { return new PermissionError('visualizar', resource); }
  static cannotWrite(resource: string) { return new PermissionError('editar', resource); }
  static cannotDelete(resource: string) { return new PermissionError('excluir', resource); }
}
