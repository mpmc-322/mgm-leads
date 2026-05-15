import { useEffect, useRef } from 'react'
import OptionCard from '../ui/OptionCard'
import NavButtons from '../ui/NavButtons'

const NEW_BUILD_OPTIONS = [
  { value: '600k-750k',  label: '$600k–$750k',  desc: '~1,500–1,800 sq ft, entry-level custom finishes' },
  { value: '750k-1m',    label: '$750k–$1M',    desc: '~1,800–2,600 sq ft, mid-tier custom finishes' },
  { value: '1m-1.5m',   label: '$1M–$1.5M',    desc: '~2,400–3,200 sq ft, nicer finishes with room to prioritize what matters most' },
  { value: '1.5m-2m',   label: '$1.5M–$2M',    desc: '~3,200–4,000 sq ft, premium materials and more complex design' },
  { value: '2m+',        label: '$2M+',          desc: 'Estate-level, fully custom' },
  { value: 'not_sure',   label: 'Not sure yet',  desc: 'We can help you figure this out' },
]

const RENO_OPTIONS = [
  { value: 'under-75k',   label: 'Under $75k',      desc: 'Single bathroom remodel or kitchen refresh' },
  { value: '75k-150k',    label: '$75k–$150k',       desc: 'Full kitchen remodel, primary bath suite, or small addition' },
  { value: '150k-300k',   label: '$150k–$300k',      desc: 'Major kitchen + bath, mid-size addition (e.g. primary suite)' },
  { value: '300k-500k',   label: '$300k–$500k',      desc: 'Large addition, multi-room renovation, or whole-floor remodel' },
  { value: '500k-1m',     label: '$500k–$1M',        desc: 'Whole-home renovation or significant expansion' },
  { value: '1m+',         label: '$1M+',             desc: 'Gut renovation or major addition with high-end finishes' },
  { value: 'not_sure',    label: 'Not sure yet',     desc: 'We can help you figure this out' },
]

export default function Step7Budget({ formData, onNext, onBack }) {
  const timerRef = useRef(null)
  const isReno   = formData.project_type === 'renovation'
  const options  = isReno ? RENO_OPTIONS : NEW_BUILD_OPTIONS

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleSelect = (value) => {
    timerRef.current = setTimeout(() => onNext({ budget_range: value }), 400)
  }

  const handleKeyDown = (e) => {
    const n = parseInt(e.key)
    if (n >= 1 && n <= options.length) handleSelect(options[n - 1].value)
  }

  return (
    <div onKeyDown={handleKeyDown}>
      <h2 className="step-heading">What's your budget range?</h2>
      <p className="step-subhead">
        Real talk — here's roughly what each range delivers in today's Maine market.
        This helps us prepare the right conversation. Many projects land somewhere in
        between — we're happy to help you figure out exactly where yours fits.
      </p>
      <div className="step-content">
        {options.map((opt, i) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.desc}
            selected={formData.budget_range === opt.value}
            onClick={() => handleSelect(opt.value)}
            index={i}
          />
        ))}
        <p className="budget-disclaimer">
          Estimates reflect current Maine costs and vary by site, design, and finishes.
          Final pricing comes after we scope your project together.
        </p>
      </div>
      <NavButtons onNext={null} onBack={onBack} showNext={false} />
    </div>
  )
}
