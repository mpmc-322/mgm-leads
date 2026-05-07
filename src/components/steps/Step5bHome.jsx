import { useState } from 'react'
import TextInput from '../ui/TextInput'
import NavButtons from '../ui/NavButtons'

export default function Step5bHome({ formData, onNext, onBack }) {
  const [yearBuilt, setYearBuilt] = useState(formData.year_built || '')
  const [sqft, setSqft]           = useState(formData.current_sq_ft || '')

  const handleNext = () => {
    onNext({
      year_built:     yearBuilt ? parseInt(yearBuilt) : null,
      current_sq_ft:  sqft      ? parseInt(sqft)      : null,
    })
  }

  const handleSkip = () => onNext({})

  const isEmpty = !yearBuilt && !sqft

  return (
    <>
      <h2 className="step-heading">Tell us a bit about your home.</h2>
      <p className="step-subhead">These help us prep — but skip anything you're not sure about.</p>
      <div className="step-content">
        <TextInput
          label="Year built"
          optional
          placeholder="e.g. 1978"
          type="number"
          value={yearBuilt}
          onChange={setYearBuilt}
          autoFocus
        />
        <TextInput
          label="Approximate square footage"
          optional
          placeholder="e.g. 1800"
          type="number"
          value={sqft}
          onChange={setSqft}
        />
      </div>
      <NavButtons onNext={handleNext} onBack={onBack} onSkip={handleSkip} showSkip={isEmpty} />
    </>
  )
}
