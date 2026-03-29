import React, { useState } from 'react';
import { useStore } from '../../../core/state/store';
import { RAMBreakdown } from '../popups/ram_breakdown';
import { AnimatePresence } from 'framer-motion';

export const RAMMonitor: React.FC = () => {
  const { appMetrics } = useStore();
  const [showPopup, setShowPopup] = useState(false);

  // Fallback to local process memory if totalMB is not yet in store
  const totalMB = appMetrics?.totalMB || 0;

  return (
    <>
      <div 
        onClick={() => setShowPopup(!showPopup)}
        className="flex items-center hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200"
        title="Industrial RAM Usage (Total Whole-App footprint)"
      >
        <span className="text-[10px] opacity-70 mr-1.5 uppercase font-mono tracking-tighter text-[var(--color-text-tertiary)]">TOTAL RAM:</span>
        <span className="font-mono text-[var(--color-accent-primary)] font-bold">{totalMB} MB</span>
      </div>

      <AnimatePresence>
        {showPopup && (
          <RAMBreakdown onClose={() => setShowPopup(false)} />
        )}
      </AnimatePresence>
    </>
  );
};
