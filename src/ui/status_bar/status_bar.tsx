import React from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { useStore } from '../../core/state/store';
import { useStatusBarState } from './hooks/use_status_bar_state';

// Atomic Command Modules
import { GitStatusSync } from './components/module_d_git_sync';
import { FormatGuard } from './components/module_f_format_guard';
import { FastTravelHub } from './components/module_c_fast_travel';
import { IndentationEngine } from './components/module_b_indentation';
import { EncodingLock } from './components/module_g_encoding_lock';
import { LanguageSwitcher } from './components/module_a_language';
import { RAMMonitor } from './components/module_e_ram_monitor';
import { NotificationHub } from './components/module_h_notifications';

export const StatusBar: React.FC = () => {
  const { toggleTerminal, isTerminalOpen, activeGroupId, editorGroups } = useStore();
  useStatusBarState();

  const activeGroup = editorGroups.find(g => g.id === activeGroupId) || editorGroups[0];
  const hasActiveFile = !!activeGroup?.activeFilePath;

  return (
    <div className="h-8 bg-[var(--color-bg-base)] text-[var(--color-text-tertiary)] flex items-center justify-between px-4 text-[11px] font-medium tracking-wide select-none border-t border-[var(--color-border-subtle)]">
      {/* Left Section: Context & Git */}
      <div className="flex items-center space-x-5">
        <GitStatusSync />
        <FormatGuard />
      </div>

      {/* Right Section: Editor Stats & Controls */}
      <div className="flex items-center space-x-6 h-full">
        {hasActiveFile && (
          <>
            <FastTravelHub />
            <IndentationEngine />
            <EncodingLock />
            <LanguageSwitcher />
          </>
        )}
        
        {/* Separator */}
        <div className="w-[1px] h-3 bg-[var(--color-border-subtle)] mx-1" />
        
        <RAMMonitor />
        
        <div 
          onClick={toggleTerminal}
          className={`flex items-center cursor-pointer transition-colors duration-200 ${isTerminalOpen ? 'text-[var(--color-accent-primary)]' : 'hover:text-[var(--color-text-primary)]'}`}
          title="Toggle Terminal (Ctrl+`)"
        >
          <TerminalIcon size={13} strokeWidth={2.5} />
        </div>
        
        <NotificationHub />
      </div>
    </div>
  );
};
