import { useState } from 'react'
import OptionCard from '../ui/OptionCard'
import TextInput from '../ui/TextInput'
import NavButtons from '../ui/NavButtons'

const SCOPES = [
  { value: 'kitchen',    label: 'Kitchen' },
  { value: 'bathroom',   label: 'Bathroom(s)' },
  { value: 'addition',   label: 'Addition / new room' },
  { value: 'whole_home', label: 'Whole-home renovation' },
  { value: 'exterior',   label: 'Exterior (siding, roofing, windows)' },
  { value: 'outdoor',    label: 'Outdoor space (deck, porch, etc.)' },
  { value: 'other',      label: 'Other' },
]

export default function Step3bScope({ formData, onNext, onBack }) {
  const [selected, setSelected] = useState(formData.reno_scope || [])
  const [otherText, setOtherText] = useState(formData.reno_scope_other || '')
  const [error, setError] = useState('')

  const toggle = (value) => {
    setSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const handleNext = () => {
    if (selected.length === 0) {
      setError('Please select at least one area so we can help you well.')
      return
    }
    setError('')
    onNext({ reno_scope: selected, reno_scope_other: otherText.trim() })
  }

  return (
    <>
      <h2 className="step-heading">What kind of work are you considering?</h2>
      <p className="step-subhead">Pick all that apply.</p>
      <div className="step-content">
        {SCOPES.map(scope => (
          <OptionCard
            key={scope.value}
            label={scope.label}
            selected={selected.includes(scope.value)}
            onClick={() => toggle(scope.value)}
            multiSelect
          />
        ))}
        {selected.includes('other') && (
          <div style={{ marginTop: 8 }}>
            <TextInput
              placeholder="Describe the other work..."
              value={otherText}
              onChange={setOtherText}
              autoFocus
            />
          </div>
        )}
        {error && <p className="field-error" style={{ marginTop: 8 }}>{error}</p>}
      </div>
      <NavButtons onNext={handleNext} onBack={onBack} />
    </>
  )
}
