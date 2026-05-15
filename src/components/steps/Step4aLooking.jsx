import { useState, useMemo, useRef } from 'react'
import NavButtons from '../ui/NavButtons'

const ALL_TOWNS = [
  'Biddeford','Brunswick','Buxton','Cape Elizabeth','Casco','Cumberland',
  'Falmouth','Freeport','Gorham','Gray','Hollis','Kennebunk','Kennebunkport',
  'Naples','North Yarmouth','Old Orchard Beach','Portland','Raymond','Saco',
  'Scarborough','Sebago','South Portland','Standish','Westbrook','Windham',
  'Yarmouth','York',
].sort()

export default function Step4aLooking({ formData, onNext, onBack }) {
  const [selected,   setSelected]   = useState(formData.areas_of_interest || [])
  const [query,      setQuery]      = useState('')
  const [otherOpen,  setOtherOpen]  = useState(false)
  const [otherValue, setOtherValue] = useState('')
  const otherRef = useRef(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ALL_TOWNS
    return ALL_TOWNS.filter(t => t.toLowerCase().includes(q))
  }, [query])

  const toggle = (town) =>
    setSelected(prev => prev.includes(town) ? prev.filter(t => t !== town) : [...prev, town])

  const openOther = () => {
    setOtherOpen(true)
    setTimeout(() => otherRef.current?.focus(), 0)
  }

  const addOther = () => {
    const val = otherValue.trim()
    if (!val || selected.map(s => s.toLowerCase()).includes(val.toLowerCase())) {
      setOtherValue('')
      return
    }
    setSelected(prev => [...prev, val])
    setOtherValue('')
  }

  const handleOtherKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addOther() }
  }

  return (
    <>
      <h2 className="step-heading">What towns or areas are you considering?</h2>
      <p className="step-subhead">Pick all that apply — this helps us understand the search.</p>
      <div className="step-content">
        {selected.length > 0 && (
          <div className="town-pills">
            {selected.map(town => (
              <button
                key={town}
                type="button"
                className="town-pill"
                onClick={() => toggle(town)}
                aria-label={`Remove ${town}`}
              >
                {town}
                <span className="town-pill-x" aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}

        <div className="town-search-wrap">
          <input
            type="text"
            className="text-input town-search-input"
            placeholder="Search towns..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="town-list" role="listbox" aria-multiselectable="true" aria-label="Towns">
          {filtered.map(town => (
            <button
              key={town}
              type="button"
              role="option"
              aria-selected={selected.includes(town)}
              className={`town-list-item${selected.includes(town) ? ' selected' : ''}`}
              onClick={() => toggle(town)}
            >
              <span className="town-list-check" aria-hidden="true">
                {selected.includes(town) && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              {town}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="town-list-empty">No towns match "{query}"</p>
          )}
        </div>

        <div className="town-other">
          {!otherOpen ? (
            <button type="button" className="town-other-trigger" onClick={openOther}>
              Don't see your town? Add it
            </button>
          ) : (
            <div className="town-other-input-row">
              <input
                ref={otherRef}
                type="text"
                className="text-input town-other-input"
                placeholder="e.g. Damariscotta, mid-coast area…"
                value={otherValue}
                onChange={e => setOtherValue(e.target.value)}
                onKeyDown={handleOtherKey}
                autoComplete="off"
              />
              <button
                type="button"
                className="town-other-add"
                onClick={addOther}
                disabled={!otherValue.trim()}
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
      <NavButtons onNext={() => onNext({ areas_of_interest: selected })} onBack={onBack} />
    </>
  )
}
