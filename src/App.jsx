import { useState, useCallback, useRef, useEffect } from 'react'
import { useFormState } from './hooks/useFormState'
import { getStepSequence } from './utils/stepSequence'
import Header from './components/Header'
import Footer from './components/Footer'
import ProgressBar from './components/ProgressBar'

import Step0Welcome      from './components/steps/Step0Welcome'
import Step1ProjectType  from './components/steps/Step1ProjectType'
import Step2Vision       from './components/steps/Step2Vision'
import Step3aLandStatus  from './components/steps/Step3aLandStatus'
import Step4aOwns        from './components/steps/Step4aOwns'
import Step4aLooking     from './components/steps/Step4aLooking'
import Step5aSize        from './components/steps/Step5aSize'
import Step6aPlans       from './components/steps/Step6aPlans'
import Step6aUpload      from './components/steps/Step6aUpload'
import Step3bScope       from './components/steps/Step3bScope'
import Step4bLocation    from './components/steps/Step4bLocation'
import Step5bHome        from './components/steps/Step5bHome'
import Step6bDocuments   from './components/steps/Step6bDocuments'
import Step7Budget       from './components/steps/Step7Budget'
import Step8Timeline     from './components/steps/Step8Timeline'
import Step9Referral     from './components/steps/Step9Referral'
import Step10Contact     from './components/steps/Step10Contact'
import Step11Confirm     from './components/steps/Step11Confirm'

const STEP_COMPONENTS = {
  welcome:          Step0Welcome,
  project_type:     Step1ProjectType,
  vision:           Step2Vision,
  land_status:      Step3aLandStatus,
  location_owns:    Step4aOwns,
  location_looking: Step4aLooking,
  size_layout:      Step5aSize,
  plans_status:     Step6aPlans,
  upload:           Step6aUpload,
  reno_scope:       Step3bScope,
  reno_address:     Step4bLocation,
  reno_home_details:Step5bHome,
  reno_documents:   Step6bDocuments,
  budget:           Step7Budget,
  timeline:         Step8Timeline,
  referral:         Step9Referral,
  contact:          Step10Contact,
  confirm:          Step11Confirm,
}

function ResumeModal({ onResume, onStartOver }) {
  return (
    <div className="resume-overlay" role="dialog" aria-modal="true" aria-labelledby="resume-title">
      <div className="resume-modal">
        <h2 id="resume-title">Welcome back.</h2>
        <p>It looks like you started an inquiry before. Would you like to pick up where you left off?</p>
        <div className="resume-actions">
          <button className="btn-resume" onClick={onResume} autoFocus>Resume</button>
          <button className="btn-start-over" onClick={onStartOver}>Start over</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const isEmbedded = new URLSearchParams(window.location.search).has('embed')

  useEffect(() => {
    if (isEmbedded) document.body.classList.add('embedded')
    return () => document.body.classList.remove('embedded')
  }, [isEmbedded])

  useEffect(() => {
    if (!isEmbedded) return
    const report = () =>
      window.parent.postMessage({ type: 'mgm-resize', height: document.documentElement.scrollHeight }, '*')
    report()
    const observer = new ResizeObserver(report)
    observer.observe(document.documentElement)
    return () => observer.disconnect()
  }, [isEmbedded])

  const { formData, updateFormData, resetFormData, hasSavedSession, savedStep, saveStep } =
    useFormState()

  const startStep = hasSavedSession ? savedStep : 'welcome'
  const [currentStepId, setCurrentStepId] = useState(startStep)
  const [displayStepId, setDisplayStepId] = useState(startStep)
  const [transDir,   setTransDir]   = useState('forward')
  const [transPhase, setTransPhase] = useState('idle')
  const [showResume, setShowResume] = useState(hasSavedSession)
  const timerRef = useRef(null)

  const goToStep = useCallback((nextId, dir, updates) => {
    const merged = updates ? { ...formData, ...updates } : formData
    if (updates) updateFormData(updates)
    saveStep(nextId)
    setCurrentStepId(nextId)
    setTransDir(dir)

    clearTimeout(timerRef.current)
    setTransPhase('exiting')
    timerRef.current = setTimeout(() => {
      setDisplayStepId(nextId)
      setTransPhase('entering')
      timerRef.current = setTimeout(() => setTransPhase('idle'), 260)
    }, 160)

    return merged
  }, [formData, updateFormData, saveStep])

  const handleNext = useCallback((updates) => {
    const merged = updates ? { ...formData, ...updates } : formData
    const steps  = getStepSequence(merged)
    const next   = steps[steps.indexOf(currentStepId) + 1]
    if (next) goToStep(next, 'forward', updates)
  }, [formData, currentStepId, goToStep])

  const handleBack = useCallback(() => {
    const steps = getStepSequence(formData)
    const prev  = steps[steps.indexOf(currentStepId) - 1]
    if (prev) goToStep(prev, 'back', null)
  }, [formData, currentStepId, goToStep])

  const handleResume    = () => setShowResume(false)
  const handleStartOver = () => {
    resetFormData()
    setShowResume(false)
    setCurrentStepId('welcome')
    setDisplayStepId('welcome')
  }

  const StepComponent = STEP_COMPONENTS[displayStepId] || Step0Welcome

  const steps          = getStepSequence(formData)
  const countable      = steps.filter(s => s !== 'welcome' && s !== 'confirm')
  const countableIndex = countable.indexOf(currentStepId)
  const showProgress   = countableIndex !== -1
  const progressCurrent = countableIndex + 1
  const progressTotal   = countable.length

  const isFirstStep = displayStepId === 'welcome'

  return (
    <div className="app">
      {showResume && (
        <ResumeModal onResume={handleResume} onStartOver={handleStartOver} />
      )}
      {!isEmbedded && <Header />}
      <main className="main" aria-live="polite">
        {showProgress && (
          <ProgressBar current={progressCurrent} total={progressTotal} />
        )}
        <div className={`step-container phase-${transPhase} dir-${transDir}`}>
          <StepComponent
            formData={formData}
            onNext={handleNext}
            onBack={handleBack}
            showBack={!isFirstStep}
          />
        </div>
      </main>
      {!isEmbedded && <Footer />}
    </div>
  )
}
