export default function Step0Welcome({ onNext }) {
  return (
    <div className="welcome-screen">
      <p className="welcome-eyebrow">MGM Builders — Since 1987</p>
      <h1 className="welcome-heading">Tell us about<br />your project.</h1>
      <p className="welcome-subhead">
        We'll get back to you within 2 business days.<br />Takes about 2 minutes.
      </p>
      <p className="welcome-body">
        We've been building and designing custom homes across Southern Maine
        since 1987. We're looking forward to hearing about yours.
      </p>
      <button className="btn-begin" onClick={() => onNext()}>
        Let's begin →
      </button>
    </div>
  )
}
