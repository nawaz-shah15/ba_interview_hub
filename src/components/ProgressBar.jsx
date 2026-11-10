export default function ProgressBar({ value, total, label = true, small = false }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div className={`pbar ${small ? 'pbar--sm' : ''}`}>
      <div className="pbar__track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="pbar__fill" style={{ width: `${pct}%` }} />
      </div>
      {label && (
        <span className="pbar__label">
          {value}/{total} prepared · {pct}%
        </span>
      )}
    </div>
  )
}
