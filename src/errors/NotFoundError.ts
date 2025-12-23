export class NotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(id ? resource + ' com ID ' + id + ' não encontrado' : resource + ' não encontrado');
    this.name = 'NotFoundError';
  }
}
