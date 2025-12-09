import type { ReactNode } from 'react'

export function FormField({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div data-describedby={describedBy}>{children}</div>
      {hint ? (
        <span id={hintId} className="muted">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
