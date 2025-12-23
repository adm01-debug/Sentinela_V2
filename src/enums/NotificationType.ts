export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  ALERT = 'alert',
}

export const NotificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.INFO]: 'Informação',
  [NotificationType.SUCCESS]: 'Sucesso',
  [NotificationType.WARNING]: 'Aviso',
  [NotificationType.ERROR]: 'Erro',
  [NotificationType.ALERT]: 'Alerta',
};
