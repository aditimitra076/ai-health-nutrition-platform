function DeleteFoodDialog({ entry, error, loading, onCancel, onConfirm }) {
  return (
    <div className="dialog-backdrop">
      <section
        aria-labelledby="delete-dialog-title"
        aria-modal="true"
        className="delete-dialog"
        role="dialog"
      >
        <div className="delete-symbol" aria-hidden="true">!</div>
        <p className="page-eyebrow">REMOVE FROM YOUR JOURNAL</p>
        <h2 id="delete-dialog-title">Delete this entry?</h2>
        <p className="delete-dialog-copy">
          <strong>{entry.foodName}</strong> will be removed from this day’s food log.
        </p>
        {error && <p className="modal-error" role="alert">{error}</p>}
        <div className="delete-dialog-actions">
          <button className="secondary-button" disabled={loading} onClick={onCancel} type="button">
            Keep entry
          </button>
          <button className="danger-button" disabled={loading} onClick={onConfirm} type="button">
            {loading ? 'Deleting…' : 'Delete entry'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default DeleteFoodDialog
