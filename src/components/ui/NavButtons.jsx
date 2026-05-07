export default function NavButtons({
  onNext, onBack, onSkip,
  nextLabel = 'Next →',
  showBack = true,
  showNext = true,
  showSkip = false,
  nextDisabled = false,
}) {
  return (
    <div className="nav-buttons">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {showBack && (
          <button type="button" className="btn-back" onClick={onBack} aria-label="Go back">
            ← Back
          </button>
        )}
        {showSkip && (
          <button type="button" className="btn-skip" onClick={onSkip}>
            Skip this step
          </button>
        )}
      </div>
      {showNext && (
        <button
          type="button"
          className="btn-next"
          onClick={onNext}
          disabled={nextDisabled}
          aria-label={nextLabel}
        >
          {nextLabel}
        </button>
      )}
    </div>
  )
}
