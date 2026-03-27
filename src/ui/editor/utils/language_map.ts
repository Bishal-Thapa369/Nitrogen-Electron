/**
 * Detect language from file extension
 */
export const getLanguage = (filePath: string): string => {
  const extension = filePath.toLowerCase().split('.').pop();
  
  const map: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'cpp': 'cpp',
    'hpp': 'cpp',
    'h': 'cpp',
    'c': 'cpp',
    'sh': 'shell',
    'bash': 'shell',
    'rs': 'rust',
    'go': 'go',
    'yaml': 'yaml',
    'yml': 'yaml',
  };

  return map[extension || ''] || 'plaintext';
};
