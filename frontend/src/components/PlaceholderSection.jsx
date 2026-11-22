function PlaceholderSection({ section }) {
  return (
    <section className="placeholder-page" aria-labelledby="placeholder-title">
      <div className="placeholder-symbol" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="page-eyebrow">A THOUGHTFUL SPACE, IN THE MAKING</p>
      <h2 id="placeholder-title">{section.label}</h2>
      <p className="placeholder-copy">{getDescription(section.id)}</p>
      <span className="coming-soon-badge">COMING SOON</span>
    </section>
  )
}

function getDescription(sectionId) {
  if (sectionId === 'assistant') {
    return 'A calm place for your health questions and ideas is taking shape.'
  }
  if (sectionId === 'summary') {
    return 'Your personal reflections and patterns will have a home here.'
  }
  return 'A space for the intentions that matter to you is on its way.'
}

export default PlaceholderSection
