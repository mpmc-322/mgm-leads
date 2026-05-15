import { useState, useMemo } from 'react'
import NavButtons from '../ui/NavButtons'

const ALL_TOWNS = [
  'Biddeford','Brunswick','Buxton','Cape Elizabeth','Casco','Cumberland',
  'Falmouth','Freeport','Gorham','Gray','Hollis','Kennebunk','Kennebunkport',
  'Naples','North Yarmouth','Old Orchard Beach','Portland','Raymond','Saco',
  'Scarborough','Sebago','South Portland','Standish','Westbrook','Windham',
  'Yarmouth','York',
].sort()

export default function Step4aLooking({ formData, onNext, onBack }) {
  const [selected, setSelected] = useState(formData.areas_of_interest || [])
  const [query, setQuery]       = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ALL_TOWNS
    return ALL_TOWNS.filter(t => t.toLowerCase().includes(q))
  }, [query])

  const customLabel = query.trim()
  const queryIsAddable =
    customLabel &&
    !ALL_TOWNS.some(t => t.toLowerCase() === customLabel.toLowerCase()) &&
    !selected.map(s => s.toLowerCase()).includes(customLabel.toLowerCase())

  const toggle = (town) =>
    setSelected(prev => prev.includes(town) ? prev.filter(t => t !== town) : [...prev, town])

  const addCustom = () => {
    if (!customLabel) return
    setSelected(prev => [...prev, customLabel])
    setQuery('')
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

          {filtered.length === 0 && !queryIsAddable && (
            <p className="town-list-empty">No towns match "{query}"</p>
          )}

          {queryIsAddable && (
            <button type="button" className="town-list-add" onClick={addCustom}>
              + Add "{customLabel}"
            </button>
          )}
        </div>
      </div>
      <NavButtons onNext={() => onNext({ areas_of_interest: selected })} onBack={onBack} />
    </>
  )
}
