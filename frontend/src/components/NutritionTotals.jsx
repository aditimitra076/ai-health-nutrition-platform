const TOTALS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', emphasis: true },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbohydrates', label: 'Carbohydrates', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'fibre', label: 'Fibre', unit: 'g' },
  { key: 'sugar', label: 'Sugar', unit: 'g' },
]

const formatAmount = (value) => new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
}).format(value)

function NutritionTotals({ totals }) {
  return (
    <section className="totals-grid" aria-label="Nutrition totals for this date">
      {TOTALS.map((item) => (
        <article className={`total-card${item.emphasis ? ' total-card-emphasis' : ''}`} key={item.key}>
          <div className="total-card-label">
            <span>{item.label}</span>
            {item.emphasis && <span className="calorie-symbol" aria-hidden="true">✳</span>}
          </div>
          <p className="total-value">
            {formatAmount(totals[item.key])}
            <span>{item.unit}</span>
          </p>
        </article>
      ))}
    </section>
  )
}

export default NutritionTotals
