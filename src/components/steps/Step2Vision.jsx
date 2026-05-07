import { useState } from 'react'
import TextArea from '../ui/TextArea'
import NavButtons from '../ui/NavButtons'

const MIN = 20

export default function Step2Vision({ formData, onNext, onBack }) {
  const [value, setValue] = useState(formData.vision || '')
  const [error, setError] = useState('')

  const trimmed   = value.trim()
  const remaining = Math.max(0, MIN - trimmed.length)
  const ready     = trimmed.length >= MIN

  const handleNext = () => {
    if (!ready) {
      setError('A bit more detail will really help us — anything else you can share?')
      return
    }
    setError('')
    onNext({ vision: trimmed })
  }

  return (
    <>
      <h2 className="step-heading">Tell us about what you're hoping to build.</h2>
      <p className="step-subhead">
        The more you share, the better we can prepare for our first conversation.
        No detail is too small — style, must-haves, what's inspiring you, family
        situation, anything.
      </p>
      <div className="step-content">
        <TextArea
          id="vision"
          placeholder="We're a family of four hoping to build a farmhouse-style home on a wooded lot we've been eyeing in Falmouth..."
          value={value}
          onChange={(v) => { setValue(v); if (error) setError('') }}
          error={error}
          autoFocus
        />
        {!ready && (
          <p className="char-hint">
            {remaining} more character{remaining !== 1 ? 's' : ''} to continue
          </p>
        )}
      </div>
      <NavButtons onNext={handleNext} onBack={onBack} nextDisabled={!ready} />
    </>
  )
}
