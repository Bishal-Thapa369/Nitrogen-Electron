import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../core/state/store';
import { Cpu, X } from 'lucide-react';

interface RAMBreakdownProps {
  onClose: () => void;
}

export const RAMBreakdown: React.FC<RAMBreakdownProps> = ({ onClose }) => {
  const { appMetrics } = useStore();

  if (!appMetrics) return null;

  // Group processes by name for a cleaner list
  const grouped = appMetrics.processes.reduce((acc, p) => {
    if (!acc[p.name]) acc[p.name] = { count: 0, memoryMB: 0 };
    acc[p.name].count += 1;
    acc[p.name].memoryMB += p.memoryMB;
    return acc;
  }, {} as Record<string, { count: number; memoryMB: number }>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute bottom-10 right-4 w-72 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-lg shadow-2xl p-4 z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Cpu size={14} className="text-[var(--color-accent-primary)]" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)]">System Health</h3>
        </div>
        <button onClick={onClose} className="hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
        {Object.entries(grouped).map(([name, data]) => (
          <div key={name} className="group flex flex-col space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                {name} {data.count > 1 ? `(x${data.count})` : ''}
              </span>
              <span className="font-bold text-[var(--color-accent-primary)]">{data.memoryMB} MB</span>
            </div>
            <div className="h-1 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((data.memoryMB / appMetrics.totalMB) * 100, 100)}%` }}
                className="h-full bg-[var(--color-accent-primary)]"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-[var(--color-border-subtle)] flex justify-between items-center">
        <span className="text-[10px] text-[var(--color-text-tertiary)]">TOTAL LOAD</span>
        <span className="text-xs font-bold font-mono text-emerald-400">{appMetrics.totalMB} MB</span>
      </div>
      
      <button 
        className="w-full mt-3 py-1.5 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-accent-primary)] hover:text-white text-[9px] uppercase font-bold tracking-widest rounded transition-all duration-300 opacity-60 hover:opacity-100"
        onClick={() => {
           // Future point: add cache clear logic
           onClose();
        }}
      >
        Flush Memory Caches
      </button>
    </motion.div>
  );
};
