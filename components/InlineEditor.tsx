import React, { useState, useEffect, useRef } from 'react';
import { CheckCircleIcon, XIcon } from './Icons';

interface InlineEditorProps {
  value: string;
  onSave: (newValue: string) => void;
}

export const InlineEditor: React.FC<InlineEditorProps> = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);
  
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleSave = () => {
    if (currentValue.trim() && currentValue !== value) {
      onSave(currentValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleCancel} // Cancel on blur to prevent accidental saves
          className="w-full p-2 bg-white border border-blue-500 rounded-md shadow-sm focus:outline-none"
        />
        <button onClick={handleSave} className="p-2 text-green-500 hover:bg-green-100 rounded-full"><CheckCircleIcon className="w-5 h-5"/></button>
        <button onClick={handleCancel} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><XIcon className="w-5 h-5"/></button>
      </div>
    );
  }

  return (
    <div onClick={() => setIsEditing(true)} className="w-full p-2 rounded-md hover:bg-gray-100 cursor-pointer text-lg font-semibold">
      {currentValue}
    </div>
  );
};
