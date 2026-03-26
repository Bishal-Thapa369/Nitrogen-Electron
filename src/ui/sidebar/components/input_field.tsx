import React from 'react';
import { Folder, FileCode } from 'lucide-react';

const ITEM_HEIGHT = 24;

interface InputFieldProps {
    itemType: 'file' | 'folder';
    parentPath: string;
    level: number;
    absoluteIndex: number;
    value: string;
    inputRef: React.RefObject<HTMLInputElement>;
    onChange: (val: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onBlur: () => void;
}

export const InputField: React.FC<InputFieldProps> = ({
    itemType, level, absoluteIndex, value, inputRef, onChange, onKeyDown, onBlur
}) => {
    return (
        <div
            className="absolute left-0 right-0 flex items-center bg-[var(--color-bg-active)] z-10 transition-all duration-200 ease-out"
            style={{ 
                top: `${absoluteIndex * ITEM_HEIGHT}px`,
                height: `${ITEM_HEIGHT}px`,
                paddingLeft: `${level * 16 + (itemType === 'folder' ? 12 : 28)}px` 
            }}
            onClick={e => e.stopPropagation()}
        >
            <div className="mr-2 flex items-center justify-center w-4 h-4 shrink-0 opacity-70">
                {itemType === 'folder' ? <Folder size={14} /> : <FileCode size={14} />}
            </div>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--color-text-primary)] ring-[0.5px] ring-[var(--color-accent-primary)] px-1 -ml-1 rounded-[2px]"
            />
        </div>
    );
};
