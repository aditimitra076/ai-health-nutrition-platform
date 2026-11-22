const ENTRY_NUTRIENTS = [
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbohydrates', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'fibre', label: 'Fibre', unit: 'g' },
  { key: 'sugar', label: 'Sugar', unit: 'g' },
  { key: 'saturatedFat', label: 'Sat. fat', unit: 'g' },
]

const formatAmount = (value) => new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
}).format(value)

function MealGroup({ mealType, entries, onEdit, onDelete }) {
  return (
    <section className="meal-group" aria-labelledby={`meal-${mealType.toLowerCase()}`}>
      <div className="meal-heading">
        <div className={`meal-icon meal-icon-${mealType.toLowerCase()}`} aria-hidden="true">
          <MealIcon mealType={mealType} />
        </div>
        <h3 id={`meal-${mealType.toLowerCase()}`}>{mealType}</h3>
        <span className="meal-count">{entries.length}</span>
        <span className="meal-divider" />
      </div>

      <div className="meal-entry-list">
        {entries.map((entry) => (
          <article className="food-entry-card" key={entry._id}>
            <div className="entry-primary">
              <div>
                <h4>{entry.foodName}</h4>
                <p className="entry-quantity">{formatAmount(entry.quantity)} {entry.unit}</p>
                {entry.notes && <p className="entry-notes">{entry.notes}</p>}
              </div>
              <div className="entry-calories">
                <strong>{formatAmount(entry.nutrients.calories)}</strong>
                <span>kcal</span>
              </div>
            </div>

            <div className="entry-details">
              {ENTRY_NUTRIENTS.map((nutrient) => (
                <span key={nutrient.key}>
                  <small>{nutrient.label}</small>
                  <strong>{formatAmount(entry.nutrients[nutrient.key])}{nutrient.unit}</strong>
                </span>
              ))}
            </div>

            <div className="entry-actions">
              <button onClick={() => onEdit(entry)} type="button">
                <EditIcon /> Edit
              </button>
              <button className="entry-delete" onClick={() => onDelete(entry)} type="button">
                <TrashIcon /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function MealIcon({ mealType }) {
  if (mealType === 'Breakfast') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2.5 12h2m15 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    )
  }
  if (mealType === 'Lunch') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 11.5h16a8 8 0 0 1-16 0ZM3 11.5h18M8 5.5V3m8 2.5V3" />
      </svg>
    )
  }
  if (mealType === 'Dinner') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3a8.5 8.5 0 1 0 8.5 8.5A7.4 7.4 0 0 1 12 3Z" />
        <path d="M16.5 4.5v4m2-4v4m-1-4v7" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 8h14l-1 12H6L5 8ZM4 5h16M9 8V5m6 3V5" />
      <path d="M9 12v4m6-4v4" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="m11.8 3.2 3 3M3 15l3.3-.7L15 5.6a1.8 1.8 0 0 0-2.6-2.6L3.7 11.7 3 15Z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3.5 5h11m-9.5 0 .6 10h6.8L13 5M7 5V3.5h4V5m-3 3v4m2-4v4" />
    </svg>
  )
}

export default MealGroup
