import { useEffect, useState } from 'react'

const NUTRIENTS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbohydrates', label: 'Carbohydrates', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'fibre', label: 'Fibre', unit: 'g' },
  { key: 'sugar', label: 'Sugar', unit: 'g' },
  { key: 'saturatedFat', label: 'Saturated fat', unit: 'g' },
]

const UNITS = ['serving', 'g', 'ml', 'piece', 'cup', 'tbsp', 'tsp', 'oz']

const initialValues = (entry) => ({
  foodName: entry?.foodName || '',
  mealType: entry?.mealType || 'Breakfast',
  quantity: String(entry?.quantity ?? 1),
  unit: entry?.unit || 'serving',
  nutrients: Object.fromEntries(
    NUTRIENTS.map(({ key }) => [key, entry ? String(entry.nutrients[key]) : '']),
  ),
  notes: entry?.notes || '',
})

const formatDate = (date) => {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(year, month - 1, day, 12))
}

function FoodEntryModal({ date, entry, onClose, onSave }) {
  const [values, setValues] = useState(() => initialValues(entry))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose, saving])

  const updateValue = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const updateNutrient = (field, value) => {
    setValues((current) => ({
      ...current,
      nutrients: { ...current.nutrients, [field]: value },
    }))
    setError('')
  }

  const submitEntry = async (event) => {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return

    if (!values.foodName.trim() || !values.unit.trim()) {
      setError('Food name and unit cannot be blank.')
      return
    }

    const payload = {
      foodName: values.foodName.trim(),
      mealType: values.mealType,
      quantity: Number(values.quantity),
      unit: values.unit.trim(),
      nutrients: Object.fromEntries(
        NUTRIENTS.map(({ key }) => [key, Number(values.nutrients[key])]),
      ),
      notes: values.notes.trim(),
      consumedDate: date,
    }

    setSaving(true)
    setError('')
    try {
      await onSave(payload)
      setSaving(false)
      onClose()
    } catch (saveError) {
      setError(saveError.message)
      setSaving(false)
    }
  }

  return (
    <div className="dialog-backdrop">
      <section
        aria-labelledby="food-modal-title"
        aria-modal="true"
        className="food-modal"
        role="dialog"
      >
        <header className="modal-header">
          <div>
            <p className="page-eyebrow">{entry ? 'UPDATE YOUR JOURNAL' : 'ADD TO YOUR JOURNAL'}</p>
            <h2 id="food-modal-title">{entry ? 'Edit food entry' : 'Add food'}</h2>
          </div>
          <button
            aria-label="Close food form"
            className="modal-close"
            disabled={saving}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </header>

        <div className="modal-date-context">
          <CalendarIcon />
          Logging for <strong>{formatDate(date)}</strong>
        </div>

        <form className="food-entry-form" onSubmit={submitEntry}>
          <div className="food-form-main-grid">
            <label className="form-field form-field-wide">
              <span>Food name <i>*</i></span>
              <input
                autoFocus
                autoComplete="off"
                maxLength={120}
                onChange={(event) => updateValue('foodName', event.target.value)}
                placeholder="e.g. Greek yogurt"
                required
                value={values.foodName}
              />
            </label>

            <label className="form-field">
              <span>Meal <i>*</i></span>
              <select
                onChange={(event) => updateValue('mealType', event.target.value)}
                required
                value={values.mealType}
              >
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Snack</option>
              </select>
            </label>

            <div className="form-field">
              <span>Quantity <i>*</i></span>
              <div className="quantity-unit-fields">
                <input
                  aria-label="Quantity"
                  max="100000"
                  min="0.000001"
                  onChange={(event) => updateValue('quantity', event.target.value)}
                  required
                  step="any"
                  type="number"
                  value={values.quantity}
                />
                <input
                  aria-label="Unit"
                  list="food-entry-units"
                  maxLength={24}
                  onChange={(event) => updateValue('unit', event.target.value)}
                  placeholder="Unit"
                  required
                  value={values.unit}
                />
                <datalist id="food-entry-units">
                  {UNITS.map((unit) => <option key={unit} value={unit} />)}
                </datalist>
              </div>
            </div>
          </div>

          <div className="nutrients-form-heading">
            <div>
              <h3>Nutrition details</h3>
              <p>Enter values per amount logged. Zero is okay.</p>
            </div>
            <span>MANUAL ENTRY</span>
          </div>

          <div className="nutrient-input-grid">
            {NUTRIENTS.map((nutrient) => (
              <label className="form-field" key={nutrient.key}>
                <span>{nutrient.label} <small>({nutrient.unit})</small><i>*</i></span>
                <input
                  max="100000"
                  min="0"
                  onChange={(event) => updateNutrient(nutrient.key, event.target.value)}
                  required
                  step="any"
                  type="number"
                  value={values.nutrients[nutrient.key]}
                />
              </label>
            ))}
          </div>

          <label className="form-field notes-field">
            <span>Notes <small>(optional)</small></span>
            <textarea
              maxLength={500}
              onChange={(event) => updateValue('notes', event.target.value)}
              placeholder="Anything you’d like to remember about this food?"
              rows={3}
              value={values.notes}
            />
            <small className="character-count">{values.notes.length}/500</small>
          </label>

          {error && <p className="modal-error" role="alert">{error}</p>}

          <footer className="modal-actions">
            <button className="secondary-button" disabled={saving} onClick={onClose} type="button">
              Cancel
            </button>
            <button className="add-food-button" disabled={saving} type="submit">
              {saving
                ? <><span className="small-spinner" /> Saving…</>
                : entry
                  ? 'Save changes'
                  : 'Add to food log'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="14" height="12" rx="2" />
      <path d="M6.5 3.5v3M13.5 3.5v3M3.5 8.5h13" />
    </svg>
  )
}

export default FoodEntryModal
