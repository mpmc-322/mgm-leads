import { useEffect } from 'react'

const FEATURED_PROJECTS = [
  { title: 'Village View Residence', type: 'Custom Home', href: 'https://mgmbuilders.com/projects/village-view-residence' },
  { title: 'Oyster House',           type: 'Custom Home', href: 'https://mgmbuilders.com/projects/oyster-house' },
  { title: 'Lake House Renovation',  type: 'Renovation',  href: 'https://mgmbuilders.com/projects' },
]

export default function Step11Confirm({ formData }) {
  const firstName = formData.first_name || 'there'

  useEffect(() => {
    localStorage.removeItem('mgm_form_data')
    localStorage.removeItem('mgm_form_step')
  }, [])

  return (
    <div className="confirm-screen">
      <div className="confirm-check" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 12L10 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="confirm-heading">Thanks, {firstName}.</h2>
      <p className="confirm-subhead">
        Mike, Taylor, or someone from our team will be in touch within 2 business days.
      </p>
      <p className="confirm-body">
        In the meantime, feel free to look around. Here are a few of our recent projects.
      </p>

      <div className="confirm-projects">
        {FEATURED_PROJECTS.map(p => (
          <a key={p.title} href={p.href} className="confirm-project-card" target="_blank" rel="noopener noreferrer">
            <span className="confirm-project-title">{p.title}</span>
            <span className="confirm-project-type">{p.type}</span>
          </a>
        ))}
      </div>

      <div className="confirm-links">
        <a href="https://mgmbuilders.com/blog" className="confirm-link" target="_blank" rel="noopener noreferrer">
          Read The Blueprints Blog →
        </a>
        <a href="https://www.instagram.com/mgmbuilders" className="confirm-link" target="_blank" rel="noopener noreferrer">
          Follow us on Instagram →
        </a>
      </div>

      <p className="confirm-contact-line">
        Prefer to call?{' '}
        <a href="tel:+12078921019">(207) 892-1019</a>
        {' '}or{' '}
        <a href="mailto:Homes@mgmbuilders.com">Homes@mgmbuilders.com</a>
      </p>
    </div>
  )
}
