import { useState } from 'react'
import TextInput from '../ui/TextInput'
import NavButtons from '../ui/NavButtons'

const TOWN_GROUPS = [
  {
    label: 'Greater Portland',
    towns: ['Portland','Falmouth','Cape Elizabeth','Scarborough','South Portland','Westbrook','Yarmouth','North Yarmouth','Cumberland'],
  },
  {
    label: 'Sebago Lakes Region',
    towns: ['Windham','Raymond','Standish','Sebago','Gray','Naples','Casco'],
  },
  {
    label: 'Lakes & Inland',
    towns: ['Gorham','Buxton','Hollis'],
  },
  {
    label: 'Southern Coast',
    towns: ['Kennebunk','Kennebunkport','Biddeford','Saco','Old Orchard Beach','York'],
  },
  {
    label: 'Midcoast',
    towns: ['Brunswick','Freeport'],
  },
]

export default function Step4aLooking({ formData, onNext, onBack }) {
  const [selected, setSelected] = useState(formData.areas_of_interest || [])
  const [showOther, setShowOther] = useState(false)
  const [otherText, setOtherText] = useState('')

  const toggle = (town) => {
    setSelected(prev =>
      prev.includes(town) ? prev.filter(t => t !== town) : [...prev, town]
    )
  }

  const handleNext = () => {
    const areas = [...selected]
    if (showOther && otherText.trim()) areas.push(otherText.trim())
    onNext({ areas_of_interest: areas })
  }

  return (
    <>
      <h2 className="step-heading">What towns or areas are you considering?</h2>
      <p className="step-subhead">Pick all that apply — this helps us understand the search.</p>
      <div className="step-content">
        {TOWN_GROUPS.map(group => (
          <div key={group.label} className="town-group">
            <p className="town-group-label">{group.label}</p>
            <div className="town-chips">
              {group.towns.map(town => (
                <button
                  key={town}
                  type="button"
                  className={`town-chip${selected.includes(town) ? ' selected' : ''}`}
                  onClick={() => toggle(town)}
                  aria-pressed={selected.includes(town)}
                >
                  {town}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="town-group">
          <div className="town-chips">
            <button
              type="button"
              className={`town-chip${showOther ? ' selected' : ''}`}
              onClick={() => setShowOther(v => !v)}
              aria-pressed={showOther}
            >
              Other / not listed
            </button>
          </div>
          {showOther && (
            <div style={{ marginTop: 12 }}>
              <TextInput
                placeholder="Enter town or area"
                value={otherText}
                onChange={setOtherText}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>
      <NavButtons onNext={handleNext} onBack={onBack} />
    </>
  )
}
