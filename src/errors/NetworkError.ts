export class NetworkError extends Error {
  constructor(message: string = 'Erro de conexão') {
    super(message);
    this.name = 'NetworkError';
  }

  static offline() { return new NetworkError('Sem conexão com a internet'); }
  static timeout() { return new NetworkError('Tempo limite excedido'); }
  static serverUnavailable() { return new NetworkError('Servidor indisponível'); }
}
