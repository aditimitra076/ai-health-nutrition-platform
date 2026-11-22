const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000')
  .replace(/\/+$/, '')

class FoodEntryApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'FoodEntryApiError'
    this.status = status
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new FoodEntryApiError(
      'Could not reach the food log. Check that the backend is running and try again.',
      0,
    )
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new FoodEntryApiError(
      data?.message || 'Something went wrong. Please try again.',
      response.status,
    )
  }

  return data
}

export const foodEntryApi = {
  getForDate(date) {
    return request(`/api/food-entries?date=${encodeURIComponent(date)}`)
  },

  create(entry) {
    return request('/api/food-entries', { method: 'POST', body: entry })
  },

  update(id, entry) {
    return request(`/api/food-entries/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: entry,
    })
  },

  remove(id) {
    return request(`/api/food-entries/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
}
