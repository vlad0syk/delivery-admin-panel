import { useId, type ReactNode, type InputHTMLAttributes } from "react"

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon: ReactNode
}

export default function FormInput({
  label,
  icon,
  id,
  className = "",
  ...rest
}: FormInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
          {icon}
        </span>

        <input
          id={inputId}
          className={`h-11 w-full rounded-lg border border-gray-200 pl-11 pr-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${className}`}
          {...rest}
        />
      </div>
    </div>
  )
}