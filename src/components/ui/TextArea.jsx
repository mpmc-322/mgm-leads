import { useRef, useEffect } from 'react'

export default function TextArea({ label, optional, placeholder, value, onChange, error, id, autoFocus }) {
  const ref = useRef(null)
  const inputId = id || 'textarea'

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])

  return (
    <div className="field-group">
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
          {optional && <span className="field-optional">(optional)</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={`text-area${error ? ' error' : ''}`}
        placeholder={placeholder}
        value={value}
        rows={4}
        onChange={e => onChange?.(e.target.value)}
        autoFocus={autoFocus}
        aria-invalid={!!error}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
