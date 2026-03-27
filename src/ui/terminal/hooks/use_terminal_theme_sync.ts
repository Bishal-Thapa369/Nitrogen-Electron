import { useEffect } from 'react';
import { Terminal as XTerm } from 'xterm';
import { getTerminalTheme } from '../utils/terminal_themes';

export const useTerminalThemeSync = (xterm: XTerm | null, theme: 'light' | 'dark' | string) => {
  useEffect(() => {
    if (xterm) {
      const themes = getTerminalTheme(theme);
      xterm.options.theme = {
        background: themes.background,
        foreground: themes.foreground,
        cursor: themes.cursor,
        selectionBackground: themes.selectionBackground,
      };
    }
  }, [xterm, theme]);
};
