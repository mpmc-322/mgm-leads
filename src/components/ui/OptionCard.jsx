export default function OptionCard({ label, description, selected, onClick, multiSelect, index }) {
  return (
    <button
      type="button"
      className={`option-card${selected ? ' selected' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      {!multiSelect && (
        <span className="option-radio" aria-hidden="true">
          <span className="option-radio-dot" />
        </span>
      )}
      {multiSelect && (
        <span className="option-check" aria-hidden="true">
          {selected && (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </span>
      )}
      <span className="option-text">
        <span className="option-label">{label}</span>
        {description && <span className="option-desc">{description}</span>}
      </span>
      {index !== undefined && (
        <span className="option-number" aria-hidden="true">{index + 1}</span>
      )}
    </button>
  )
}
