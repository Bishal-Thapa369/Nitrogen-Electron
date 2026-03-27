import { ITheme } from 'xterm';

export const getTerminalTheme = (theme: 'light' | 'dark' | string): ITheme => ({
  background: 'transparent',
  foreground: theme === 'light' ? '#333333' : '#EDEDED',
  cursor: theme === 'light' ? '#333333' : '#3B82F6',
  selectionBackground: theme === 'light' ? '#add6ff' : '#2563EB40',
  black: '#000000',
  red: '#EF4444',
  green: '#10B981',
  yellow: '#F59E0B',
  blue: '#3B82F6',
  magenta: '#8B5CF6',
  cyan: '#06B6D4',
  white: '#F4F4F5',
  brightBlack: '#52525B',
  brightRed: '#F87171',
  brightGreen: '#34D399',
  brightYellow: '#FBBF24',
  brightBlue: '#60A5FA',
  brightMagenta: '#A78BFA',
  brightCyan: '#22D3EE',
  brightWhite: '#FAFAFA'
});
