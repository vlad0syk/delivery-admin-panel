import { type FormEvent } from "react"
import FormInput from "./FormInput"
import Button from "./Button"

export default function LoginForm({ onSubmit }: { onSubmit?: (e: FormEvent) => void }) {
  return (
    <form className="space-y-5" onSubmit={e => { e.preventDefault(); onSubmit?.(e) }}>
      <FormInput
        label="Administrator Email"
        type="email"
        name="email"
        autoComplete="email"
        required
        placeholder="admin@example.com"
        icon={
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <title>Іконка email</title>
            <path d="M4 6h16v12H4z" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        }
      />

      <FormInput
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
        icon={
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <title>Іконка пароля</title>
            <path d="M16 11V8a4 4 0 0 0-8 0v3" />
            <path d="M6 11h12v10H6z" />
          </svg>
        }
      />
       <Button type="submit">Authenticate</Button>
    </form>
  )
}