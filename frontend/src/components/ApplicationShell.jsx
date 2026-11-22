import { useState } from 'react'
import BrandMark from './BrandMark.jsx'
import DailyNutrition from './DailyNutrition.jsx'
import PlaceholderSection from './PlaceholderSection.jsx'
import './Application.css'

const SECTIONS = [
  { id: 'daily', label: 'Daily Nutrition', mobileLabel: 'Daily', icon: 'leaf' },
  { id: 'assistant', label: 'AI Health Assistant', mobileLabel: 'Assistant', icon: 'chat' },
  { id: 'summary', label: 'Summary', mobileLabel: 'Summary', icon: 'summary' },
  { id: 'goals', label: 'Goals', mobileLabel: 'Goals', icon: 'target' },
]

function ApplicationShell({ user, busy, error, onLogout }) {
  const [activeSection, setActiveSection] = useState('daily')
  const activeSectionDetails = SECTIONS.find((section) => section.id === activeSection)

  const renderNavigation = (mobile = false) => (
    <nav className={mobile ? 'mobile-navigation' : 'sidebar-navigation'} aria-label="Main navigation">
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          aria-current={activeSection === section.id ? 'page' : undefined}
          aria-label={mobile ? section.label : undefined}
          className={`navigation-item${activeSection === section.id ? ' navigation-item-active' : ''}`}
          onClick={() => setActiveSection(section.id)}
          type="button"
        >
          <NavigationIcon name={section.icon} />
          <span>{mobile ? section.mobileLabel : section.label}</span>
          {activeSection === section.id && !mobile && <span className="active-indicator" />}
        </button>
      ))}
    </nav>
  )

  return (
    <div className="application-shell">
      <aside className="app-sidebar">
        <BrandMark />
        <p className="sidebar-overline">YOUR SPACE</p>
        {renderNavigation()}

        <div className="sidebar-bottom">
          <span className="sidebar-avatar" aria-hidden="true">{user.email.charAt(0).toUpperCase()}</span>
          <div className="sidebar-user-copy">
            <span>PERSONAL ACCOUNT</span>
            <strong title={user.email}>{user.email}</strong>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <div className="mobile-brand"><BrandMark /></div>
          <div className="header-welcome">
            <p>YOUR PERSONAL HEALTH SPACE</p>
            <h1>{activeSectionDetails.label}</h1>
          </div>
          <div className="header-account">
            <span className="header-email" title={user.email}>{user.email}</span>
            <button className="header-logout" disabled={busy === 'logout'} onClick={onLogout} type="button">
              {busy === 'logout' ? 'Signing out…' : 'Sign out'}
            </button>
            {error && <span className="logout-error" role="alert">{error}</span>}
          </div>
        </header>

        <main className="app-content">
          {activeSection === 'daily'
            ? <DailyNutrition />
            : <PlaceholderSection section={activeSectionDetails} />}
        </main>
      </div>

      {renderNavigation(true)}
    </div>
  )
}

function NavigationIcon({ name }) {
  if (name === 'leaf') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M19.5 4.5C11.3 4.2 5.2 6.5 4.1 11.6c-.7 3.2 1.5 5.7 4.5 5.3 4.6-.6 7.1-6.2 10.9-12.4Z" />
        <path d="M4.2 20c1.6-5.1 5.3-8.8 11.1-11.1" />
      </svg>
    )
  }

  if (name === 'chat') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.1-.6L4 20l1.5-4A7.5 7.5 0 1 1 20 11.5Z" />
        <path d="M8.5 11.5h.01M12.5 11.5h.01M16.5 11.5h.01" />
      </svg>
    )
  }

  if (name === 'summary') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 19V5M4 19h16" />
        <path d="m7 15 3.5-4 3 2 5-6" />
        <path d="M18.5 7H20v1.5" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 12 19 5" />
    </svg>
  )
}

export default ApplicationShell
