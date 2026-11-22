const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')

class AuthApiError extends Error {
  constructor(message, status, retryAfter) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
    this.retryAfter = retryAfter
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: options.body
        ? { 'Content-Type': 'application/json', ...options.headers }
        : options.headers,
    })
  } catch {
    throw new AuthApiError('Could not reach the sign-in service. Check that the backend is running and try again.', 0, 0)
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new AuthApiError(
      data?.message || 'Something went wrong. Please try again.',
      response.status,
      Number(response.headers.get('Retry-After')) || 0,
    )
  }

  return data
}

export const authApi = {
  requestOtp(email) {
    return request('/api/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  verifyOtp(email, otp) {
    return request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    })
  },

  getCurrentUser() {
    return request('/api/auth/me')
  },

  logout() {
    return request('/api/auth/logout', { method: 'POST' })
  },
}
