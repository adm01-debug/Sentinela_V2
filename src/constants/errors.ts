export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
};

export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.UNAUTHORIZED]: 'Sessão expirada. Faça login novamente.',
  [ERROR_CODES.FORBIDDEN]: 'Você não tem permissão para esta ação.',
  [ERROR_CODES.NOT_FOUND]: 'Recurso não encontrado.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Dados inválidos.',
  [ERROR_CODES.SERVER_ERROR]: 'Erro no servidor. Tente novamente.',
  [ERROR_CODES.NETWORK_ERROR]: 'Erro de conexão.',
  [ERROR_CODES.TIMEOUT]: 'Tempo esgotado.',
};
