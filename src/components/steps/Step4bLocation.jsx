import { useState } from 'react'
import TextInput from '../ui/TextInput'
import NavButtons from '../ui/NavButtons'

export default function Step4bLocation({ formData, onNext, onBack }) {
  const [street, setStreet] = useState(formData.reno_street || '')
  const [town,   setTown]   = useState(formData.reno_town   || '')
  const [zip,    setZip]    = useState(formData.reno_zip    || '')
  const [errors, setErrors] = useState({})

  const handleNext = () => {
    const errs = {}
    if (!street.trim()) errs.street = 'This one\'s needed so we can help you well.'
    if (!town.trim())   errs.town   = 'This one\'s needed so we can help you well.'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    onNext({ reno_street: street.trim(), reno_town: town.trim(), reno_zip: zip.trim() })
  }

  return (
    <>
      <h2 className="step-heading">What's the address of the home?</h2>
      <p className="step-subhead">
        We'll use this to look up the property and check on permits or surveys before our call.
      </p>
      <div className="step-content">
        <TextInput
          label="Street address"
          placeholder="e.g. 120 Forest Avenue"
          value={street}
          onChange={setStreet}
          error={errors.street}
          autoFocus
        />
        <TextInput
          label="Town or city"
          placeholder="e.g. Portland"
          value={town}
          onChange={setTown}
          error={errors.town}
        />
        <TextInput
          label="ZIP code"
          optional
          placeholder="04101"
          value={zip}
          onChange={(v) => setZip(v.slice(0, 5))}
          type="number"
        />
      </div>
      <NavButtons onNext={handleNext} onBack={onBack} />
    </>
  )
}
