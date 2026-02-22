interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
}

export function TextInput({ value, onChange, placeholder, error, type = 'text' }: TextInputProps) {
  return (
    <div className={`bg-[#22272a] relative rounded-[12px] w-full ${error ? 'border border-[#ff6a6a]' : ''}`}>
      {!error && <div aria-hidden="true" className="absolute border border-[#3d4448] border-solid inset-0 pointer-events-none rounded-[12px]" />}
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[12px] relative w-full">
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none font-['Open_Sans:Regular',sans-serif] text-[14px] text-white placeholder:text-[#f5f5f5] leading-[20px]"
            style={{ fontVariationSettings: "'wdth' 100" }}
          />
        </div>
      </div>
    </div>
  );
}
