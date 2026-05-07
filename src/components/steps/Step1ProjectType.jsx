import { useEffect, useRef } from 'react'
import OptionCard from '../ui/OptionCard'

const OPTIONS = [
  { value: 'new_build',   label: 'Build a new custom home' },
  { value: 'renovation',  label: 'Renovate or add onto my existing home' },
  { value: 'not_sure',    label: 'Not sure yet — or both' },
]

export default function Step1ProjectType({ formData, onNext, onBack }) {
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleSelect = (value) => {
    const updates = {
      project_type: value,
      unsure_branch: value === 'not_sure',
    }
    timerRef.current = setTimeout(() => onNext(updates), 400)
  }

  const handleKeyDown = (e) => {
    const n = parseInt(e.key)
    if (n >= 1 && n <= OPTIONS.length) handleSelect(OPTIONS[n - 1].value)
  }

  return (
    <div onKeyDown={handleKeyDown}>
      <h2 className="step-heading">What kind of project are you considering?</h2>
      <p className="step-subhead" style={{ marginBottom: 24 }}>Select one to continue.</p>
      <div className="step-content">
        {OPTIONS.map((opt, i) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={formData.project_type === opt.value}
            onClick={() => handleSelect(opt.value)}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}
