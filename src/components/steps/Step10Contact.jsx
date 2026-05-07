import { useState } from 'react'
import TextInput from '../ui/TextInput'
import NavButtons from '../ui/NavButtons'

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3)  return digits
  if (digits.length <= 6)  return `(${digits.slice(0,3)}) ${digits.slice(3)}`
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Step10Contact({ formData, onNext, onBack }) {
  const [first, setFirst]   = useState(formData.first_name || '')
  const [last,  setLast]    = useState(formData.last_name  || '')
  const [email, setEmail]   = useState(formData.email      || '')
  const [phone, setPhone]   = useState(formData.phone      || '')
  const [errors, setErrors] = useState({})

  const handlePhoneBlur = () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 10) setPhone(formatPhone(phone))
  }

  const handleNext = () => {
    const errs = {}
    if (!first.trim()) errs.first = 'This one\'s needed so we can help you well.'
    if (!last.trim())  errs.last  = 'This one\'s needed so we can help you well.'
    if (!EMAIL_RE.test(email.trim())) errs.email = 'That doesn\'t look quite right — mind double-checking?'
    if (phone.replace(/\D/g, '').length !== 10) errs.phone = 'We need a phone number we can reach you at.'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    onNext({
      first_name: first.trim(),
      last_name:  last.trim(),
      email:      email.trim().toLowerCase(),
      phone:      formatPhone(phone),
    })
  }

  return (
    <>
      <h2 className="step-heading">Last step — how can we reach you?</h2>
      <p className="step-subhead">We'll only use this to follow up about your project.</p>
      <div className="step-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextInput
            label="First name"
            placeholder="Taylor"
            value={first}
            onChange={setFirst}
            error={errors.first}
            autoFocus
          />
          <TextInput
            label="Last name"
            placeholder="Smith"
            value={last}
            onChange={setLast}
            error={errors.last}
          />
        </div>
        <TextInput
          label="Email"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
        />
        <TextInput
          label="Cell phone"
          type="tel"
          placeholder="(207) 555-1234"
          value={phone}
          onChange={setPhone}
          onBlur={handlePhoneBlur}
          error={errors.phone}
        />
        <p className="recaptcha-note">
          Protected by reCAPTCHA.{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          {' '}and{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms</a>
          {' '}apply.
        </p>
      </div>
      <NavButtons onNext={handleNext} onBack={onBack} nextLabel="Send inquiry →" />
    </>
  )
}
