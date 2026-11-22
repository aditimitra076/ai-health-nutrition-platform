function BrandMark({ light = false }) {
  return (
    <a className={`brand-mark${light ? ' brand-mark-light' : ''}`} href="/" aria-label="Nourish home">
      <span className="brand-icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M25.8 5.7C16 5.4 8.6 8.2 7.3 14.3c-.8 3.8 1.8 6.7 5.3 6.2 5.4-.7 8.3-7.3 13.2-14.8Z" />
          <path d="M7.3 26.4c1.9-6.1 6.4-10.5 13.4-13.2" />
          <path d="M21.5 18.1c1.8 2.8 1.2 5.9-1.6 7.3-2.8 1.4-5.8.2-6.3-2.7" />
        </svg>
      </span>
      <span className="brand-name">nourish<span>.</span></span>
    </a>
  )
}

export default BrandMark
