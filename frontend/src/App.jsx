import { useEffect, useState } from 'react'
import AuthPage from './components/AuthPage.jsx'
import ApplicationShell from './components/ApplicationShell.jsx'
import { authApi } from './services/authApi.js'
import './App.css'

const EMPTY_OTP = ['', '', '', '', '', '']
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function App() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(EMPTY_OTP)
  const [step, setStep] = useState('email')
  const [busy, setBusy] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)

  const updateEmail = (value) => {
    setEmail(value)
    setError('')
    setNotice('')
  }

  const updateOtp = (digits) => {
    setOtp(digits)
    setError('')
  }

  useEffect(() => {
    let active = true

    authApi.getCurrentUser()
      .then((response) => {
        if (active) setUser(response.user)
      })
      .catch((requestError) => {
        if (active && requestError.status !== 401) {
          setNotice('We could not check your saved session. You can still sign in below.')
        }
      })
      .finally(() => {
        if (active) setCheckingSession(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (cooldown === 0) return undefined

    const timer = window.setTimeout(() => {
      setCooldown((remaining) => Math.max(remaining - 1, 0))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [cooldown])

  const requestOtp = async (event) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError('Enter a valid email address to continue.')
      return
    }

    setEmail(normalizedEmail)
    setBusy('request')
    setError('')
    setNotice('')

    try {
      await authApi.requestOtp(normalizedEmail)
      setStep('otp')
      setOtp([...EMPTY_OTP])
      setCooldown(60)
      setNotice(`If this address can receive email, a code is on its way to ${normalizedEmail}.`)
    } catch (requestError) {
      if (requestError.status === 429 && requestError.message.toLowerCase().includes('wait before requesting')) {
        setStep('otp')
        setCooldown(requestError.retryAfter || 60)
        setNotice(`A code may already be on its way to ${normalizedEmail}.`)
      } else if (requestError.status === 429 && requestError.retryAfter) {
        setCooldown(requestError.retryAfter)
      }
      setError(requestError.message)
    } finally {
      setBusy('')
    }
  }

  const verifyOtp = async (event) => {
    event.preventDefault()
    const code = otp.join('')
    if (!/^\d{6}$/.test(code)) {
      setError('Enter all six digits from your email.')
      return
    }

    setBusy('verify')
    setError('')
    setNotice('')

    try {
      const response = await authApi.verifyOtp(email, code)
      setUser(response.user)
      setOtp([...EMPTY_OTP])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy('')
    }
  }

  const resendOtp = async () => {
    if (cooldown > 0 || busy) return

    setBusy('request')
    setError('')
    setNotice('')

    try {
      await authApi.requestOtp(email)
      setOtp([...EMPTY_OTP])
      setCooldown(60)
      setNotice(`If this address can receive email, a new code is on its way to ${email}.`)
    } catch (requestError) {
      if (requestError.status === 429) setCooldown(requestError.retryAfter || 60)
      setError(requestError.message)
    } finally {
      setBusy('')
    }
  }

  const changeEmail = () => {
    setStep('email')
    setOtp([...EMPTY_OTP])
    setCooldown(0)
    setError('')
    setNotice('')
  }

  const logout = async () => {
    setBusy('logout')
    setError('')
    setNotice('')

    try {
      await authApi.logout()
      setUser(null)
      setEmail('')
      setStep('email')
      setOtp([...EMPTY_OTP])
      setCooldown(0)
      setNotice('You have been securely signed out.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy('')
    }
  }

  if (checkingSession) {
    return (
      <main className="session-loading" aria-live="polite">
        <span className="loading-spinner" aria-hidden="true" />
        <p>Checking your secure session</p>
      </main>
    )
  }

  if (user) {
    return <ApplicationShell user={user} busy={busy} error={error} onLogout={logout} />
  }

  return (
    <AuthPage
      email={email}
      step={step}
      otp={otp}
      busy={busy}
      cooldown={cooldown}
      error={error}
      notice={notice}
      onEmailChange={updateEmail}
      onOtpChange={updateOtp}
      onRequestOtp={requestOtp}
      onVerifyOtp={verifyOtp}
      onResendOtp={resendOtp}
      onChangeEmail={changeEmail}
    />
  )
}

export default App
