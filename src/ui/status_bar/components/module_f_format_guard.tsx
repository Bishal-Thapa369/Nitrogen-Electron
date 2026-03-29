import { Check } from 'lucide-react';

export const FormatGuard: React.FC = () => {
  const handleFormat = () => {
    // This will trigger the global command palette with "format" or dispatch
    // a custom event that Monaco listens to.
    console.log('Triggering global format...');
  };

  return (
    <div 
      onClick={handleFormat}
      className="flex items-center hover:text-[var(--color-text-primary)] cursor-pointer transition-colors duration-200"
      title="Format Document (Prettier/Internal)"
    >
      <Check size={13} strokeWidth={2.5} className="mr-1.5 text-emerald-500" />
      <span>Prettier</span>
    </div>
  );
};
