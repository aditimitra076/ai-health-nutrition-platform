import BrandPanel from './BrandPanel.jsx'
import OtpCodeInput from './OtpCodeInput.jsx'

const CURRENT_YEAR = new Date().getFullYear()

function AuthPage({
  email,
  step,
  otp,
  busy,
  cooldown,
  error,
  notice,
  onEmailChange,
  onOtpChange,
  onRequestOtp,
  onVerifyOtp,
  onResendOtp,
  onChangeEmail,
}) {
  const requesting = busy === 'request'
  const verifying = busy === 'verify'
  const cooldownLabel = cooldown > 0
    ? `Resend in ${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, '0')}`
    : 'Resend code'

  return (
    <main className="auth-shell">
      <BrandPanel />

      <section className="auth-panel" aria-label="Sign in">
        <div className="auth-mobile-brand"><BrandPanel /></div>
        <div className="auth-content">
          <div className="secure-label">
            <span className="secure-dot" />
            PRIVATE BY DESIGN
          </div>

          <div className="step-label">
            <span className={`step-number${step === 'email' ? ' step-active' : ' step-complete'}`}>
              {step === 'email' ? '01' : '✓'}
            </span>
            <span className="step-rule" />
            <span className={`step-number${step === 'otp' ? ' step-active' : ''}`}>02</span>
            <span className="step-caption">{step === 'email' ? 'EMAIL' : 'VERIFY'}</span>
          </div>

          {step === 'email' ? (
            <>
              <p className="eyebrow">YOUR SPACE, YOUR PACE</p>
              <h2 className="auth-title">Welcome to a healthier you.</h2>
              <p className="auth-intro">
                Sign in or create your account with your email. No password to remember.
              </p>

              <form className="auth-form" onSubmit={onRequestOtp} noValidate>
                <label htmlFor="email">Email address</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
                    <path d="m5 7 7 5.5L19 7" />
                  </svg>
                  <input
                    autoComplete="email"
                    id="email"
                    maxLength={254}
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>

                <Feedback error={error} notice={notice} />

                <button className="primary-button" disabled={requesting || cooldown > 0} type="submit">
                  {requesting
                    ? <><span className="button-spinner" /> Sending code</>
                    : cooldown > 0
                      ? cooldownLabel
                      : <>Send a sign-in code <ArrowIcon /></>}
                </button>
              </form>

              <p className="form-footnote">
                <LockIcon /> We’ll only use your email to keep your account secure.
              </p>
            </>
          ) : (
            <>
              <button className="back-link" onClick={onChangeEmail} type="button">
                <ArrowIcon direction="left" /> Change email
              </button>
              <p className="eyebrow">ONE LAST STEP</p>
              <h2 className="auth-title">Check your inbox.</h2>
              <p className="auth-intro">
                Enter the six-digit code sent to <strong className="email-highlight">{email}</strong>.
              </p>

              <form className="auth-form otp-form" onSubmit={onVerifyOtp} noValidate>
                <fieldset className="otp-field">
                  <legend>Verification code</legend>
                  <OtpCodeInput value={otp} onChange={onOtpChange} disabled={verifying} />
                </fieldset>

                <Feedback error={error} notice={notice} />

                <button className="primary-button" disabled={verifying || otp.join('').length !== 6} type="submit">
                  {verifying ? <><span className="button-spinner" /> Verifying</> : <>Verify and continue <ArrowIcon /></>}
                </button>
              </form>

              <div className="resend-row">
                <span>Didn't receive an email?</span>
                <button
                  className="text-button"
                  disabled={requesting || cooldown > 0}
                  onClick={onResendOtp}
                  type="button"
                >
                  {requesting
                    ? 'Sending…'
                    : cooldownLabel}
                </button>
              </div>
              <p className="form-footnote otp-footnote">
                <LockIcon /> Your code expires in 5 minutes and can only be used once.
              </p>
            </>
          )}
        </div>

        <footer className="auth-footer">
          <span>© {CURRENT_YEAR} Nourish</span>
          <span className="footer-separator">·</span>
          <span>Thoughtful health, every day.</span>
        </footer>
      </section>
    </main>
  )
}

function Feedback({ error, notice }) {
  if (error) {
    return <p className="form-feedback feedback-error" role="alert">{error}</p>
  }

  if (notice) {
    return <p className="form-feedback feedback-notice" role="status">{notice}</p>
  }

  return null
}

function ArrowIcon({ direction = 'right' }) {
  return (
    <svg className={`arrow-icon arrow-${direction}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h11M10 5l5 5-5 5" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="lock-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="3.5" y="7.5" width="11" height="8" rx="2" />
      <path d="M6 7.5V5a3 3 0 0 1 6 0v2.5M9 10.5v2" />
    </svg>
  )
}

export default AuthPage
