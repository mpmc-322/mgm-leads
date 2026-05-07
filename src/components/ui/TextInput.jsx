export default function TextInput({
  label, optional, helper, placeholder, value, onChange, onBlur,
  type = 'text', error, id, autoFocus,
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="field-group">
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
          {optional && <span className="field-optional">(optional)</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`text-input${error ? ' error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onBlur={onBlur}
        autoFocus={autoFocus}
        aria-describedby={helper || error ? `${inputId}-hint` : undefined}
        aria-invalid={!!error}
      />
      {(helper || error) && (
        <span id={`${inputId}-hint`} className={error ? 'field-error' : 'field-helper'}>
          {error || helper}
        </span>
      )}
    </div>
  )
}
