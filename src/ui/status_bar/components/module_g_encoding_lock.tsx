import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { useStore } from '../../../core/state/store';

export const EncodingLock: React.FC = () => {
  const { encoding, eol, readOnly, setReadOnly } = useStore();

  return (
    <div className="flex items-center space-x-4">
      <div 
        className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200 uppercase"
        title="Change File Encoding"
      >
        {encoding}
      </div>
      <div 
        className="hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200"
        title="Change Line Endings"
      >
        {eol}
      </div>
      <div 
        onClick={() => setReadOnly(!readOnly)}
        className={`cursor-pointer transition-colors duration-200 ${readOnly ? 'text-amber-500' : 'hover:text-[var(--color-text-primary)]'}`}
        title={readOnly ? 'Locked: Read Only' : 'Unlocked: Ready to Edit'}
      >
        {readOnly ? <Lock size={12} strokeWidth={2.5} /> : <Unlock size={12} strokeWidth={2} className="opacity-40" />}
      </div>
    </div>
  );
};
