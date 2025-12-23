export const emailTemplates = {
  welcome: (name: string) => ({ subject: 'Bem-vindo ao Sentinela!', body: 'Olá ' + name + ', seja bem-vindo!' }),
  passwordReset: (link: string) => ({ subject: 'Redefinir Senha', body: 'Clique no link para redefinir: ' + link }),
  violation: (type: string, employee: string) => ({ subject: 'Violação Detectada', body: 'Violação de ' + type + ' detectada para ' + employee }),
  report: (name: string, period: string) => ({ subject: 'Relatório ' + name, body: 'Relatório do período ' + period + ' disponível.' }),
};
