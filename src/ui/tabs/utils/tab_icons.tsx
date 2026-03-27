import { FileCode, FileJson, FileType2, FileText, FileImage, FileCode2, FileTerminal } from 'lucide-react';

/**
 * Maps filenames to themed Lucide icons
 */
export const getFileIcon = (filename: string) => {
  const name = filename.toLowerCase();
  
  if (name.endsWith('.js') || name.endsWith('.jsx')) return <FileCode2 size={14} className="text-yellow-400" />;
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return <FileType2 size={14} className="text-blue-400" />;
  if (name.endsWith('.json')) return <FileJson size={14} className="text-green-400" />;
  if (name.endsWith('.md')) return <FileText size={14} className="text-slate-400" />;
  if (name.endsWith('.css')) return <FileCode size={14} className="text-pink-400" />;
  if (name.endsWith('.html')) return <FileCode size={14} className="text-orange-400" />;
  if (name.endsWith('.sh') || name.endsWith('.bash')) return <FileTerminal size={14} className="text-emerald-400" />;
  if (name.match(/\.(png|jpe?g|svg|gif|ico)$/i)) return <FileImage size={14} className="text-purple-400" />;
  if (name.endsWith('.cpp') || name.endsWith('.hpp') || name.endsWith('.h') || name.endsWith('.c')) return <FileCode size={14} className="text-sky-400" />;
  if (name.endsWith('.rs')) return <FileCode2 size={14} className="text-orange-600" />;
  
  return <FileCode size={14} className="text-[var(--color-text-tertiary)]" />;
};
