import { useState } from 'react'
import TextInput from '../ui/TextInput'
import NavButtons from '../ui/NavButtons'

export default function Step4aOwns({ formData, onNext, onBack }) {
  const [town,   setTown]   = useState(formData.location_town   || '')
  const [street, setStreet] = useState(formData.location_street || '')
  const [zip,    setZip]    = useState(formData.location_zip    || '')
  const [taxMap, setTaxMap] = useState(formData.location_tax_map|| '')
  const [error,  setError]  = useState('')

  const handleNext = () => {
    if (!town.trim()) {
      setError('This one\'s needed so we can help you well.')
      return
    }
    setError('')
    onNext({ location_town: town.trim(), location_street: street.trim(), location_zip: zip.trim(), location_tax_map: taxMap.trim() })
  }

  return (
    <>
      <h2 className="step-heading">Where will the home be built?</h2>
      <div className="step-content" style={{ marginTop: 32 }}>
        <TextInput
          label="Town or city"
          placeholder="e.g. Falmouth"
          value={town}
          onChange={setTown}
          error={error}
          autoFocus
        />
        <TextInput
          label="Street address"
          optional
          helper="If you have it handy"
          placeholder="e.g. 42 Ledge Road"
          value={street}
          onChange={setStreet}
        />
        <TextInput
          label="ZIP code"
          optional
          placeholder="04101"
          value={zip}
          onChange={(v) => setZip(v.slice(0, 5))}
          type="number"
        />
        <TextInput
          label="Tax map / lot number"
          optional
          helper="Helps us look up the parcel before we talk"
          placeholder="e.g. Map 14, Lot 7"
          value={taxMap}
          onChange={setTaxMap}
        />
      </div>
      <NavButtons onNext={handleNext} onBack={onBack} />
    </>
  )
}
