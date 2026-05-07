import { useState } from 'react'
import OptionCard from '../ui/OptionCard'
import NavButtons from '../ui/NavButtons'

const OPTIONS = [
  { value: 'google',        label: 'Google or web search' },
  { value: 'instagram',     label: 'Instagram' },
  { value: 'facebook',      label: 'Facebook' },
  { value: 'houzz',         label: 'Houzz' },
  { value: 'friend_family', label: 'Referral from a friend or family member' },
  { value: 'professional',  label: 'Referral from a designer, architect, or realtor' },
  { value: 'drove_by',      label: 'Drove by one of our projects' },
  { value: 'sign',          label: 'Saw an MGM sign' },
  { value: 'other',         label: 'Other' },
]

export default function Step9Referral({ formData, onNext, onBack }) {
  const [selected, setSelected] = useState(formData.referral_source || null)

  return (
    <>
      <h2 className="step-heading">How did you hear about us?</h2>
      <div className="step-content" style={{ marginTop: 32 }}>
        {OPTIONS.map(opt => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            selected={selected === opt.value}
            onClick={() => setSelected(opt.value)}
          />
        ))}
      </div>
      <NavButtons
        onNext={() => onNext({ referral_source: selected })}
        onBack={onBack}
        onSkip={() => onNext({ referral_source: null })}
        showSkip={!selected}
      />
    </>
  )
}
