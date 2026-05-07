import { useEffect, useRef } from 'react'
import OptionCard from '../ui/OptionCard'
import NavButtons from '../ui/NavButtons'

const OPTIONS = [
  { value: 'within_3mo',  label: 'Within 3 months' },
  { value: '3_6mo',       label: '3–6 months' },
  { value: '6_12mo',      label: '6–12 months' },
  { value: '12mo_plus',   label: '12+ months' },
  { value: 'exploring',   label: 'Just exploring' },
]

export default function Step8Timeline({ formData, onNext, onBack }) {
  const timerRef = useRef(null)
  const isReno   = formData.project_type === 'renovation'

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleSelect = (value) => {
    timerRef.current = setTimeout(() => onNext({ timeline: value }), 400)
  }

  const handleKeyDown = (e) => {
    const n = parseInt(e.key)
    if (n >= 1 && n <= OPTIONS.length) handleSelect(OPTIONS[n - 1].value)
  }

  return (
    <div onKeyDown={handleKeyDown}>
      <h2 className="step-heading">When are you hoping to start?</h2>
      <p className="step-subhead" style={{ marginBottom: 24 }}>
        {isReno ? 'When would you like work to begin?' : 'When would you like to break ground?'}
      </p>
      <div className="step-content">
        {OPTIONS.map((opt, i) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={formData.timeline === opt.value}
            onClick={() => handleSelect(opt.value)}
            index={i}
          />
        ))}
      </div>
      <NavButtons onNext={null} onBack={onBack} showNext={false} />
    </div>
  )
}
