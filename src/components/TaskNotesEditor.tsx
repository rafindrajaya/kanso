import React, { useState, useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';

interface TaskNotesEditorProps {
  taskId: string;
  initialNotes?: string;
  onSave: (notes: string) => void;
}

export const TaskNotesEditor: React.FC<TaskNotesEditorProps> = ({
  initialNotes = '',
  onSave,
}): React.JSX.Element => {
  const [text, setText] = useState<string>(initialNotes);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  const isFocusedRef = useRef<boolean>(false);
  const lastSavedRef = useRef<string>(initialNotes);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync prop changes ONLY when the user is NOT actively typing/focused
  useEffect(() => {
    if (!isFocusedRef.current) {
      setText(initialNotes);
      lastSavedRef.current = initialNotes;
      setIsSaved(true);
    }
  }, [initialNotes]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const val = e.target.value;
    setText(val);
    setIsSaved(false);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Relaxed 1500ms idle save: only saves after user completely pauses typing
    debounceTimerRef.current = setTimeout(() => {
      if (val !== lastSavedRef.current) {
        onSave(val);
        lastSavedRef.current = val;
      }
      setIsSaved(true);
    }, 1500);
  };

  const handleFocus = (): void => {
    isFocusedRef.current = true;
  };

  // Immediate save when user clicks outside / finishes editing
  const handleBlur = (): void => {
    isFocusedRef.current = false;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (text !== lastSavedRef.current) {
      onSave(text);
      lastSavedRef.current = text;
    }
    setIsSaved(true);
  };

  return (
    <div className="mt-3 pt-3 border-t-2 border-dashed border-comic-ink/20 dark:border-white/20 pl-7 pr-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-comic-inkMuted dark:text-neutral-400">
          <FileText size={12} />
          Notes & Details
        </span>
        <span
          className={`text-[10px] font-mono font-bold transition-opacity ${
            isSaved
              ? 'text-comic-green dark:text-emerald-400 opacity-90'
              : 'text-amber-600 dark:text-amber-400 opacity-100'
          }`}
        >
          {isSaved ? 'Saved ✓' : 'Editing...'}
        </span>
      </div>
      <textarea
        value={text}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Add details, notes, or bullet points here..."
        rows={3}
        className="w-full p-2.5 rounded-xl border-2 border-comic-ink/20 dark:border-white/20 bg-comic-bg/60 dark:bg-neutral-900/60 text-xs font-mono text-[#0F0F0F] dark:text-white placeholder:text-comic-inkMuted/60 dark:placeholder:text-neutral-500 focus:outline-none focus:border-comic-ink dark:focus:border-white transition-all resize-y"
      />
    </div>
  );
};
