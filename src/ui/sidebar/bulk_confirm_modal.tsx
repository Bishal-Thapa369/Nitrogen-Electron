import React from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../core/state/store';
import { AlertCircle, Trash2, ClipboardPaste } from 'lucide-react';

export const BulkConfirmModal: React.FC = () => {
  const { confirmBulkOperation, setConfirmBulk } = useStore();

  if (!confirmBulkOperation || !confirmBulkOperation.isOpen) return null;

  const { itemCount, operation, onProceed } = confirmBulkOperation;
  const isDelete = operation === 'delete';

  const accentColor = isDelete ? 'rgb(248, 113, 113)' : 'rgb(56, 189, 248)';
  const accentBg = isDelete ? 'rgba(248, 113, 113, 0.1)' : 'rgba(56, 189, 248, 0.1)';

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
      {/* Dynamic Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-md animate-in fade-in duration-500"
        onClick={() => setConfirmBulk(null)}
      />

      {/* Premium Glass Modal */}
      <div className="relative w-full max-w-[420px] bg-[#1a1b1e]/90 border border-white/5 rounded-[28px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 fade-in duration-300 ease-out flex flex-col items-center text-center">
        
        {/* Glow Header */}
        <div className="pt-10 pb-6 w-full flex flex-col items-center">
            <div 
                className="w-16 h-16 rounded-[22px] flex items-center justify-center mb-6 shadow-inner relative group"
                style={{ backgroundColor: accentBg, color: accentColor }}
            >
                <div className="absolute inset-0 rounded-[22px] blur-xl opacity-40 animate-pulse" style={{ backgroundColor: accentColor }} />
                {isDelete ? <Trash2 size={32} strokeWidth={2.5} /> : <ClipboardPaste size={32} strokeWidth={2.5} />}
            </div>

            <div className="px-8 space-y-2">
                <h2 className="text-xl font-black tracking-tight text-white capitalize leading-none">
                    {isDelete ? 'Delete' : 'Paste'} {itemCount} Items?
                </h2>
                <p className="text-[14px] text-slate-400 font-medium leading-relaxed">
                    Nitrogen has detected a bulk operation. Confirm to proceed with the native filesystem execution.
                </p>
            </div>
        </div>

        {/* Dynamic Operation Badge */}
        <div className="flex items-center gap-3 px-10 w-full">
            <div className="h-px flex-1 bg-white/5" />
            <div 
               className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/5 text-white/40"
            >
               Target: {operation}
            </div>
            <div className="h-px flex-1 bg-white/5" />
        </div>

        {/* Caution Message */}
        <div className="p-8 pb-10 flex flex-col w-full gap-5">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
                <AlertCircle size={18} className="text-amber-400/80 shrink-0 mt-0.5" />
                <p className="text-[12px] text-slate-500 leading-normal">
                    Proceeding will trigger a background streaming process. This cannot be easily reversed once the disk writing begins.
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <button
                    onClick={() => onProceed()}
                    className="w-full py-4 rounded-2xl text-[14px] font-black text-white transition-all active:scale-[0.98] shadow-2xl hover:brightness-110 active:brightness-90"
                    style={{ 
                        background: `linear-gradient(135deg, ${accentColor}, ${isDelete ? 'rgb(220, 38, 38)' : 'rgb(2, 132, 199)'})`,
                        boxShadow: `0 12px 24px -8px ${isDelete ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.4)'}`
                    }}
                >
                    Confirm & Execute
                </button>
                <button
                    onClick={() => setConfirmBulk(null)}
                    className="w-full py-4 rounded-2xl text-[13px] font-bold text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                    Cancel
                </button>
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
