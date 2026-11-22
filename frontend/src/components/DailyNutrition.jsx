import { useEffect, useMemo, useState } from 'react'
import DeleteFoodDialog from './DeleteFoodDialog.jsx'
import FoodEntryModal from './FoodEntryModal.jsx'
import MealGroup from './MealGroup.jsx'
import NutritionTotals from './NutritionTotals.jsx'
import { foodEntryApi } from '../services/foodEntryApi.js'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

const getLocalDate = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const dateFromString = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

const formatDate = (dateString, options) => (
  new Intl.DateTimeFormat(undefined, options).format(dateFromString(dateString))
)

function DailyNutrition() {
  const [selectedDate, setSelectedDate] = useState(() => getLocalDate())
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [modalState, setModalState] = useState(null)
  const [entryToDelete, setEntryToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true

    foodEntryApi.getForDate(selectedDate)
      .then((response) => {
        if (!Array.isArray(response?.entries)) {
          throw new Error('The food log returned an unexpected response.')
        }
        if (active) setEntries(response.entries)
      })
      .catch((error) => {
        if (active) setLoadError(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedDate, refreshVersion])

  const today = getLocalDate()
  const isToday = selectedDate === today
  const visibleEntries = useMemo(
    () => entries.filter((entry) => entry.consumedDate === selectedDate),
    [entries, selectedDate],
  )
  const totals = useMemo(() => visibleEntries.reduce((result, entry) => {
    for (const nutrient of Object.keys(result)) {
      result[nutrient] += Number(entry.nutrients?.[nutrient] ?? 0)
    }
    return result
  }, {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fibre: 0,
    sugar: 0,
  }), [visibleEntries])

  const changeDate = (date) => {
    if (!date) return
    setSelectedDate(date)
    setLoading(true)
    setLoadError('')
    setActionError('')
    setNotice('')
  }

  const moveDate = (amount) => {
    const date = dateFromString(selectedDate)
    date.setDate(date.getDate() + amount)
    changeDate(getLocalDate(date))
  }

  const saveEntry = async (payload) => {
    const existingEntry = modalState?.entry
    if (existingEntry) {
      await foodEntryApi.update(existingEntry._id, payload)
      setNotice(`${payload.foodName} was updated.`)
    } else {
      await foodEntryApi.create(payload)
      setNotice(`${payload.foodName} was added to your food log.`)
    }
    setLoading(true)
    setLoadError('')
    setActionError('')
    setRefreshVersion((version) => version + 1)
  }

  const deleteEntry = async () => {
    if (!entryToDelete) return

    setDeleting(true)
    setActionError('')
    try {
      await foodEntryApi.remove(entryToDelete._id)
      setNotice(`${entryToDelete.foodName} was removed from your food log.`)
      setEntryToDelete(null)
      setLoading(true)
      setLoadError('')
      setRefreshVersion((version) => version + 1)
    } catch (error) {
      setActionError(error.message)
    } finally {
      setDeleting(false)
    }
  }

  const clearNotice = () => {
    setNotice('')
    setActionError('')
  }

  const entriesByMeal = MEAL_TYPES.map((mealType) => ({
    mealType,
    entries: visibleEntries.filter((entry) => entry.mealType === mealType),
  })).filter((group) => group.entries.length > 0)

  return (
    <div className="daily-page">
      <section className="daily-heading">
        <div>
          <p className="page-eyebrow">YOUR DAILY JOURNAL</p>
          <div className="selected-date-line">
            <h2>{formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
            {isToday && <span className="today-badge">TODAY</span>}
          </div>
          <p className="date-subtitle">
            {isToday
              ? 'A simple look at what you’ve enjoyed today.'
              : `Food entries for ${formatDate(selectedDate, { month: 'long', day: 'numeric', year: 'numeric' })}.`}
          </p>
        </div>

        <div className="date-controls" aria-label="Choose a day">
          <button className="date-arrow" onClick={() => moveDate(-1)} type="button" aria-label="Previous day">
            <ChevronIcon direction="left" />
          </button>
          <label className="date-picker">
            <CalendarIcon />
            <span className="visually-hidden">Choose date</span>
            <input
              aria-label="Choose date"
              onChange={(event) => changeDate(event.target.value)}
              type="date"
              value={selectedDate}
            />
          </label>
          <button className="date-arrow" onClick={() => moveDate(1)} type="button" aria-label="Next day">
            <ChevronIcon direction="right" />
          </button>
          {!isToday && (
            <button className="today-button" onClick={() => changeDate(today)} type="button">
              Today
            </button>
          )}
        </div>
      </section>

      {notice && (
        <div className="action-notice" role="status">
          <span className="notice-check" aria-hidden="true">✓</span>
          {notice}
          <button aria-label="Dismiss message" onClick={clearNotice} type="button">×</button>
        </div>
      )}
      {actionError && !entryToDelete && (
        <div className="action-error" role="alert">{actionError}</div>
      )}

      <NutritionTotals totals={totals} />

      <section className="food-log-section" aria-labelledby="food-log-title">
        <div className="food-log-heading">
          <div>
            <h2 id="food-log-title">Your food log</h2>
            <p>{visibleEntries.length} {visibleEntries.length === 1 ? 'entry' : 'entries'} for this day</p>
          </div>
          <button className="add-food-button" onClick={() => setModalState({ entry: null })} type="button">
            <PlusIcon /> Add food
          </button>
        </div>

        {loading ? (
          <div className="food-loading" role="status">
            <span className="loading-spinner" />
            <span>Loading your food log…</span>
          </div>
        ) : loadError ? (
          <div className="food-state-card">
            <div className="state-icon state-error" aria-hidden="true">!</div>
            <h3>We couldn’t load this day.</h3>
            <p>{loadError}</p>
            <button
              className="secondary-button"
              onClick={() => {
                setLoading(true)
                setLoadError('')
                setRefreshVersion((version) => version + 1)
              }}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : visibleEntries.length === 0 ? (
          <div className="food-state-card empty-food-state">
            <div className="empty-plate" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="empty-overline">A FRESH PAGE</p>
            <h3>Nothing logged just yet.</h3>
            <p>Add a meal or snack to start your daily food log.</p>
            <button className="secondary-button" onClick={() => setModalState({ entry: null })} type="button">
              <PlusIcon /> Add your first food
            </button>
          </div>
        ) : (
          <div className="meal-groups">
            {entriesByMeal.map((group) => (
              <MealGroup
                key={group.mealType}
                entries={group.entries}
                mealType={group.mealType}
                onDelete={setEntryToDelete}
                onEdit={(entry) => setModalState({ entry })}
              />
            ))}
          </div>
        )}
      </section>

      {modalState && (
        <FoodEntryModal
          key={modalState.entry?._id || 'new-entry'}
          date={selectedDate}
          entry={modalState.entry}
          onClose={() => setModalState(null)}
          onSave={saveEntry}
        />
      )}
      {entryToDelete && (
        <DeleteFoodDialog
          entry={entryToDelete}
          error={entryToDelete && actionError ? actionError : ''}
          loading={deleting}
          onCancel={() => {
            setEntryToDelete(null)
            setActionError('')
          }}
          onConfirm={deleteEntry}
        />
      )}
    </div>
  )
}

function ChevronIcon({ direction }) {
  return (
    <svg className={`chevron-icon chevron-${direction}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m7 4 6 6-6 6" />
    </svg>
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

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4v12M4 10h12" />
    </svg>
  )
}

export default DailyNutrition
