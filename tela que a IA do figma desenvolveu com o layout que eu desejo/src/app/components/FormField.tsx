import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, required, helperText, error, children }: FormFieldProps) {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative w-full">
      <div className="content-stretch flex gap-[4px] items-center relative w-full">
        <p className="font-['Open_Sans:SemiBold',sans-serif] font-semibold leading-[20px] text-[14px] text-white" style={{ fontVariationSettings: "'wdth' 100" }}>
          {label}
        </p>
        {required && (
          <p className="font-['Open_Sans:SemiBold',sans-serif] font-semibold leading-[20px] text-[14px] text-[#ff6a6a]" style={{ fontVariationSettings: "'wdth' 100" }}>
            *
          </p>
        )}
      </div>
      {children}
      {(helperText || error) && (
        <p className={`font-['Open_Sans:Regular',sans-serif] text-[12px] leading-[18px] ${error ? 'text-[#ff6a6a]' : 'text-[#cbd4d6]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
