import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  error?: string;
}

export function TagsInput({ value, onChange, placeholder, error }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <div className={`bg-[#22272a] relative rounded-[12px] w-full ${error ? 'border border-[#ff6a6a]' : ''}`}>
        {!error && <div aria-hidden="true" className="absolute border border-[#3d4448] border-solid inset-0 pointer-events-none rounded-[12px]" />}
        <div className="flex flex-wrap gap-2 items-center p-[12px]">
          {value.map((tag, index) => (
            <div key={index} className="bg-[rgba(22,166,223,0.2)] border border-[#16a6df] rounded-[6px] px-[8px] py-[4px] flex items-center gap-[4px]">
              <span className="font-['Open_Sans:Regular',sans-serif] text-[14px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
                {tag}
              </span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-white hover:text-[#ff6a6a] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 bg-transparent border-none outline-none font-['Open_Sans:Regular',sans-serif] text-[14px] text-white placeholder:text-[#f5f5f5] min-w-[200px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          />
        </div>
      </div>
      {error && (
        <p className="font-['Open_Sans:Regular',sans-serif] text-[12px] text-[#ff6a6a] mt-[4px]" style={{ fontVariationSettings: "'wdth' 100" }}>
          {error}
        </p>
      )}
    </div>
  );
}
