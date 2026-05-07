import { useEffect, useRef } from 'react'
import OptionCard from '../ui/OptionCard'
import NavButtons from '../ui/NavButtons'

const OPTIONS = [
  { value: 'has_full',  label: 'Yes, I have full plans' },
  { value: 'has_rough', label: 'I have rough sketches or inspiration' },
  { value: 'no_plans',  label: 'No, I\'d like help designing' },
]

export default function Step6aPlans({ formData, onNext, onBack }) {
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleSelect = (value) => {
    timerRef.current = setTimeout(() => onNext({ plans_status: value }), 400)
  }

  const handleKeyDown = (e) => {
    const n = parseInt(e.key)
    if (n >= 1 && n <= OPTIONS.length) handleSelect(OPTIONS[n - 1].value)
  }

  return (
    <div onKeyDown={handleKeyDown}>
      <h2 className="step-heading">Do you have plans or designs already?</h2>
      <div className="step-content" style={{ marginTop: 32 }}>
        {OPTIONS.map((opt, i) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={formData.plans_status === opt.value}
            onClick={() => handleSelect(opt.value)}
            index={i}
          />
        ))}
      </div>
      <NavButtons onNext={null} onBack={onBack} showNext={false} />
    </div>
  )
}
