export function KpiCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint: string
}) {
  return (
    <article className="card kpi">
      <dl>
        <dt>{label}</dt>
        <dd aria-describedby={`${label}-hint`}>{value}</dd>
      </dl>
      <p id={`${label}-hint`} className="muted">
        {hint}
      </p>
    </article>
  )
}
