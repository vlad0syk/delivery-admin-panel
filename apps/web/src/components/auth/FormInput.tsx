import { useId } from "react"

type FormInputProps = {
  id?: string
  label: string
  type: string
  placeholder: string
  icon: React.ReactNode
}

export default function FormInput({
  id,
  label,
  type,
  placeholder,
  icon,
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
          type={type}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border border-gray-200 pl-11 pr-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
      </div>
    </div>
  )
}