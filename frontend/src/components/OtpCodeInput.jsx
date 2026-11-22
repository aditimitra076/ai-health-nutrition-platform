import { useRef } from 'react'

function OtpCodeInput({ value, onChange, disabled }) {
  const inputRefs = useRef([])

  const updateDigit = (index, digit) => {
    const nextValue = [...value]
    nextValue[index] = digit
    onChange(nextValue)
  }

  const handleChange = (index, inputValue) => {
    const digits = inputValue.replace(/\D/g, '')
    if (!digits) {
      updateDigit(index, '')
      return
    }

    if (digits.length > 1) {
      const nextValue = [...value]
      digits.slice(0, 6).split('').forEach((digit, digitIndex) => {
        nextValue[digitIndex] = digit
      })
      onChange(nextValue)
      inputRefs.current[Math.min(digits.length, 5)]?.focus()
      return
    }

    updateDigit(index, digits)
    if (index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      event.preventDefault()
      updateDigit(index - 1, '')
      inputRefs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (event.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (event) => {
    const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!digits) return

    event.preventDefault()
    const nextValue = [...EMPTY_DIGITS]
    digits.split('').forEach((digit, index) => {
      nextValue[index] = digit
    })
    onChange(nextValue)
    inputRefs.current[Math.min(digits.length, 5)]?.focus()
  }

  return (
    <div className="otp-input-row" role="group" aria-label="Six-digit verification code">
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(element) => { inputRefs.current[index] = element }}
          aria-label={`Digit ${index + 1} of 6`}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={index === 0}
          className="otp-digit"
          disabled={disabled}
          inputMode="numeric"
          maxLength={index === 0 ? 6 : 1}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          onPaste={handlePaste}
          pattern="[0-9]*"
          type="text"
          value={digit}
        />
      ))}
    </div>
  )
}

const EMPTY_DIGITS = ['', '', '', '', '', '']

export default OtpCodeInput
