import type { ButtonHTMLAttributes } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean
}

export default function Button({
  children,
  isLoading = false,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={` block h-11 w-full rounded-lg bg-indigo-600 text-sm font-medium text-white transition-all hover:bg-indigo-700 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? "Loading..." : children}
    </button>
  )
}