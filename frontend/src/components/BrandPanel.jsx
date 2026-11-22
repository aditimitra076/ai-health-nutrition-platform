import BrandMark from './BrandMark.jsx'

function BrandPanel() {
  return (
    <aside className="brand-panel">
      <BrandMark light />

      <div className="brand-message">
        <p className="eyebrow eyebrow-light">HEALTH, MADE PERSONAL</p>
        <h1>A little more in tune with you.</h1>
        <p className="brand-description">
          Make space for the habits that help you feel your best. Your next chapter starts with one small step.
        </p>
      </div>

      <div className="wellbeing-art" aria-hidden="true">
        <div className="art-orbit orbit-outer" />
        <div className="art-orbit orbit-inner" />
        <div className="art-sun" />
        <div className="art-leaf leaf-one" />
        <div className="art-leaf leaf-two" />
        <div className="art-leaf leaf-three" />
        <span className="art-dot dot-one" />
        <span className="art-dot dot-two" />
        <span className="art-dot dot-three" />
        <div className="art-caption">
          <span className="caption-line" />
          <span>YOUR WELLNESS, AT YOUR PACE</span>
        </div>
      </div>

      <div className="brand-panel-footer">
        <span className="footer-spark" aria-hidden="true">✳</span>
        <span>A thoughtful space for your health journey.</span>
      </div>
    </aside>
  )
}

export default BrandPanel
