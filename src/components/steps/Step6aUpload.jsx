import NavButtons from '../ui/NavButtons'

export default function Step6aUpload({ onNext, onBack }) {
  return (
    <>
      <h2 className="step-heading">Share what you have.</h2>
      <p className="step-subhead">
        Plans, surveys, septic designs, inspiration photos — anything that helps
        us understand your vision. You can also send these later.
      </p>
      <div className="step-content">
        <div className="upload-zone" role="button" tabIndex={0} aria-label="Upload files">
          <div className="upload-icon">📎</div>
          <p className="upload-label">Drag files here, or <span className="upload-link">browse</span></p>
          <p className="upload-helper">Accepts PDF, JPG, PNG, DWG — up to 25 MB per file, 5 files max</p>
        </div>
        <p className="budget-disclaimer" style={{ marginTop: 16 }}>
          File uploads will be available when the form goes live. You can always email files directly to{' '}
          <a href="mailto:Homes@mgmbuilders.com" style={{ color: 'var(--slate-blue)' }}>Homes@mgmbuilders.com</a>.
        </p>
      </div>
      <NavButtons onNext={() => onNext({})} onBack={onBack} onSkip={() => onNext({})} showSkip nextLabel="Next →" />
    </>
  )
}
