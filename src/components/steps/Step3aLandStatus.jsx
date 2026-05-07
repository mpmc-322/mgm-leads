import { useEffect, useRef } from 'react'
import OptionCard from '../ui/OptionCard'
import NavButtons from '../ui/NavButtons'

const OPTIONS = [
  { value: 'owns',           label: 'I own the land' },
  { value: 'under_contract', label: 'I have land under contract or in mind' },
  { value: 'looking',        label: 'I\'m still looking for land' },
  { value: 'needs_help',     label: 'I\'d like help finding land' },
]

export default function Step3aLandStatus({ formData, onNext, onBack }) {
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleSelect = (value) => {
    timerRef.current = setTimeout(() => onNext({ land_status: value }), 400)
  }

  const handleKeyDown = (e) => {
    const n = parseInt(e.key)
    if (n >= 1 && n <= OPTIONS.length) handleSelect(OPTIONS[n - 1].value)
  }

  return (
    <div onKeyDown={handleKeyDown}>
      <h2 className="step-heading">Where are you on the land?</h2>
      <div className="step-content" style={{ marginTop: 32 }}>
        {OPTIONS.map((opt, i) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={formData.land_status === opt.value}
            onClick={() => handleSelect(opt.value)}
            index={i}
          />
        ))}
      </div>
      <NavButtons onNext={null} onBack={onBack} showNext={false} />
    </div>
  )
}
