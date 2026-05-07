export default function Stepper({ label, value, onChange, min = 0, max = 20, step = 1 }) {
  const display = value === 0 ? '—' : value % 1 === 0 ? String(value) : value.toFixed(1)

  return (
    <div className="stepper-group">
      {label && <span className="stepper-label">{label}</span>}
      <div className="stepper" role="group" aria-label={label}>
        <button
          type="button"
          className="stepper-btn"
          onClick={() => onChange(Math.max(min, +(value - step).toFixed(1)))}
          disabled={value <= min}
          aria-label="Decrease"
        >
          −
        </button>
        <span className="stepper-value" aria-live="polite">{display}</span>
        <button
          type="button"
          className="stepper-btn"
          onClick={() => onChange(Math.min(max, +(value + step).toFixed(1)))}
          disabled={value >= max}
          aria-label="Increase"
        >
          +
        </button>
      </div>
    </div>
  )
}
