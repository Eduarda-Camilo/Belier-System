const variantClasses = {
  primary:
    'bg-[#d94b28] text-white hover:bg-[#c23a1a] active:bg-[#a62c10] border border-transparent shadow-[0_2px_8px_rgba(217,75,40,0.25)]',
  secondary:
    'bg-[#1e293b] text-white hover:bg-[#334155] active:bg-[#475569] border border-white/10',
  outline:
    'bg-transparent text-white hover:bg-white/5 active:bg-white/10 border border-[#2d3748]',
  ghost:
    'bg-transparent text-[#94a3b8] hover:text-white hover:bg-white/5 active:bg-white/10 border border-transparent',
  destructive:
    'bg-red-500/10 text-red-500 hover:bg-red-500/20 active:bg-red-500/30 border border-red-500/20',
}

const sizeClasses = {
  sm: 'px-4 py-1.5 text-[13px]',
  md: 'px-5 py-2 text-[14px]',
  lg: 'px-8 py-3 text-[16px]',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-all duration-200 cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d94b28] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111822]',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-inherit disabled:hover:text-inherit disabled:hover:border-inherit disabled:shadow-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
