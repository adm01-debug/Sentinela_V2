import { create } from '@storybook/theming/create';

export default create({
  base: 'light',
  brandTitle: 'Sentinela Design System',
  brandUrl: 'https://github.com/adm01-debug/sentinela',
  brandTarget: '_self',
  
  // Colors
  colorPrimary: '#3B82F6',
  colorSecondary: '#6366F1',
  
  // UI
  appBg: '#F8FAFC',
  appContentBg: '#FFFFFF',
  appBorderColor: '#E2E8F0',
  appBorderRadius: 8,
  
  // Text colors
  textColor: '#1E293B',
  textInverseColor: '#FFFFFF',
  
  // Toolbar
  barTextColor: '#64748B',
  barSelectedColor: '#3B82F6',
  barBg: '#FFFFFF',
  
  // Form colors
  inputBg: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputTextColor: '#1E293B',
  inputBorderRadius: 6,
});
