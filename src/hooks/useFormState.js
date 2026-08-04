import { useState, useEffect } from 'react'

const STORAGE_KEY = 'mgm_form_data'
const STEP_KEY    = 'mgm_form_step'

const initialFormData = {
  project_type:      null,
  unsure_branch:     false,
  vision:            '',
  // Branch A — new build
  land_status:       null,
  location_town:     '',
  location_street:   '',
  location_zip:      '',
  location_tax_map:  '',
  areas_of_interest: [],
  square_footage:    null,
  bedrooms:          0,
  bathrooms:         0,
  plans_status:      null,
  // Branch B — renovation
  reno_scope:        [],
  reno_scope_other:  '',
  reno_street:       '',
  reno_town:         '',
  reno_zip:          '',
  year_built:        null,
  current_sq_ft:     null,
  // Shared
  budget_range:      null,
  timeline:          null,
  referral_source:   null,
  // Contact
  first_name:        '',
  last_name:         '',
  email:             '',
  phone:             '',
}

export function useFormState() {
  const [formData, setFormData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? { ...initialFormData, ...JSON.parse(raw) } : initialFormData
    } catch {
      return initialFormData
    }
  })

  const [savedStep] = useState(() => {
    return localStorage.getItem(STEP_KEY) || 'welcome'
  })

  const hasSavedSession = !!(
    localStorage.getItem(STORAGE_KEY) &&
    savedStep !== 'welcome' &&
    savedStep !== 'confirm'
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
  }, [formData])

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const resetFormData = () => {
    setFormData(initialFormData)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STEP_KEY)
  }

  const saveStep = (stepId) => {
    localStorage.setItem(STEP_KEY, stepId)
  }

  return { formData, updateFormData, resetFormData, hasSavedSession, savedStep, saveStep }
}
