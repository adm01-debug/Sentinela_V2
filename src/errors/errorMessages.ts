export const ErrorMessages = {
  GENERIC: 'Ocorreu um erro. Tente novamente.',
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  FORBIDDEN: 'Você não tem permissão para esta ação.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION: 'Dados inválidos. Verifique os campos.',
  SERVER: 'Erro no servidor. Tente novamente mais tarde.',
  TIMEOUT: 'A requisição demorou muito. Tente novamente.',
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return ErrorMessages.GENERIC;
}
