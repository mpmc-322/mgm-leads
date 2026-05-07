export function getStepSequence(formData) {
  const isReno = formData.project_type === 'renovation'
  const landStatus = formData.land_status
  const plansStatus = formData.plans_status

  const steps = ['welcome', 'project_type', 'vision']

  if (isReno) {
    steps.push('reno_scope', 'reno_address', 'reno_home_details', 'reno_documents')
  } else {
    steps.push('land_status')
    if (landStatus === 'owns' || landStatus === 'under_contract') {
      steps.push('location_owns')
    } else {
      steps.push('location_looking')
    }
    steps.push('size_layout', 'plans_status')
    if (plansStatus === 'has_full' || plansStatus === 'has_rough') {
      steps.push('upload')
    }
  }

  steps.push('budget', 'timeline', 'referral', 'contact', 'confirm')
  return steps
}

export function getStepNumbers(steps) {
  // Steps that count toward progress (exclude welcome and confirm)
  const countable = steps.filter(s => s !== 'welcome' && s !== 'confirm')
  return countable
}
