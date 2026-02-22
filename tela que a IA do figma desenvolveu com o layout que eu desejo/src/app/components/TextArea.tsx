interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  rows?: number;
  maxLength?: number;
}

export function TextArea({ value, onChange, placeholder, error, rows = 3, maxLength }: TextAreaProps) {
  return (
    <div>
      <div className={`bg-[#22272a] relative rounded-[12px] w-full ${error ? 'border border-[#ff6a6a]' : ''}`}>
        {!error && <div aria-hidden="true" className="absolute border border-[#3d4448] border-solid inset-0 pointer-events-none rounded-[12px]" />}
        <div className="content-stretch flex items-start p-[12px] relative w-full">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            className="w-full bg-transparent border-none outline-none font-['Open_Sans:Regular',sans-serif] text-[14px] text-white placeholder:text-[#f5f5f5] leading-[20px] resize-none"
            style={{ fontVariationSettings: "'wdth' 100" }}
          />
        </div>
      </div>
      {maxLength && (
        <div className="content-stretch flex items-center justify-start relative mt-[4px]">
          <p className="font-['Open_Sans:Regular',sans-serif] leading-[18px] text-[#cbd4d6] text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            {value.length}/{maxLength} caracteres
          </p>
        </div>
      )}
    </div>
  );
}
