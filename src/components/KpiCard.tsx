function hintIdFor(label: string): string {
  return `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-hint`
}

export function KpiCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint: string
}) {
  const hintId = hintIdFor(label)
  return (
    <article className="card kpi">
      <dl>
        <dt>{label}</dt>
        <dd aria-describedby={hintId}>{value}</dd>
      </dl>
      <p id={hintId} className="muted">
        {hint}
      </p>
    </article>
  )
}
