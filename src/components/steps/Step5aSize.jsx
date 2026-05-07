import { useState } from 'react'
import TextInput from '../ui/TextInput'
import Stepper from '../ui/Stepper'
import NavButtons from '../ui/NavButtons'

export default function Step5aSize({ formData, onNext, onBack }) {
  const [sqft,     setSqft]     = useState(formData.square_footage || '')
  const [bedrooms, setBedrooms] = useState(formData.bedrooms || 0)
  const [baths,    setBaths]    = useState(formData.bathrooms || 0)

  const handleNext = () => {
    onNext({
      square_footage: sqft ? parseInt(sqft) : null,
      bedrooms,
      bathrooms: baths,
    })
  }

  const handleSkip = () => onNext({})

  const isEmpty = !sqft && bedrooms === 0 && baths === 0

  return (
    <>
      <h2 className="step-heading">What size are you thinking?</h2>
      <p className="step-subhead">Don't worry if you're not sure yet — we can work this out together.</p>
      <div className="step-content" style={{ marginTop: 4 }}>
        <TextInput
          label="Approximate square footage"
          optional
          placeholder="e.g. 2400"
          type="number"
          value={sqft}
          onChange={setSqft}
        />
        <div style={{ display: 'flex', gap: 32, marginTop: 8 }}>
          <Stepper label="Bedrooms" value={bedrooms} onChange={setBedrooms} />
          <Stepper label="Bathrooms" value={baths} onChange={setBaths} step={0.5} />
        </div>
      </div>
      <NavButtons
        onNext={handleNext}
        onBack={onBack}
        onSkip={handleSkip}
        showSkip={isEmpty}
      />
    </>
  )
}
