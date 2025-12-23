export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }

  static unauthorized() { return new AuthError('Não autorizado', 'UNAUTHORIZED'); }
  static forbidden() { return new AuthError('Acesso negado', 'FORBIDDEN'); }
  static tokenExpired() { return new AuthError('Token expirado', 'TOKEN_EXPIRED'); }
  static invalidCredentials() { return new AuthError('Credenciais inválidas', 'INVALID_CREDENTIALS'); }
}
