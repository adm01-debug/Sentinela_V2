export enum DeviceType {
  DESKTOP = 'desktop',
  LAPTOP = 'laptop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  UNKNOWN = 'unknown',
}

export const DeviceTypeLabels: Record<DeviceType, string> = {
  [DeviceType.DESKTOP]: 'Desktop',
  [DeviceType.LAPTOP]: 'Notebook',
  [DeviceType.MOBILE]: 'Celular',
  [DeviceType.TABLET]: 'Tablet',
  [DeviceType.UNKNOWN]: 'Desconhecido',
};
