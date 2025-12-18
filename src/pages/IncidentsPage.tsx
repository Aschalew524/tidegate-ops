import { useState } from 'react'
import { FormField } from '../components/FormField.tsx'
import { StatusPill } from '../components/StatusPill.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { formatStamp } from '../lib/time.ts'
import { useHarbor } from '../state/HarborContext.tsx'
import type { IncidentSeverity } from '../types/harbor.ts'

export function IncidentsPage() {
  const { state, dispatch, actor } = useHarbor()
  useDocumentTitle('Incidents · Tidegate Ops')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [severity, setSeverity] = useState<IncidentSeverity>('moderate')
  const [error, setError] = useState('')

  function fileIncident() {
    if (title.trim().length < 8) {
      setError('Give the watch at least eight characters of title.')
      return
    }
    setError('')
    dispatch({
      type: 'file-incident',
      input: {
        title: title.trim(),
        summary: summary.trim(),
        severity,
        actor,
        berthId: null,
        vesselId: null,
      },
    })
    setTitle('')
    setSummary('')
  }

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Incident log</h1>
          <p>Harbor safety and disruption record for the reach.</p>
        </div>
      </div>
      <div className="split">
        <form
          className="card stack"
          onSubmit={(event) => {
            event.preventDefault()
            fileIncident()
          }}
        >
          <h2>File incident</h2>
          <FormField id="inc-title" label="Title" error={error}>
            <input
              id="inc-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={Boolean(error)}
            />
          </FormField>
          <FormField id="inc-sev" label="Severity">
            <select
              id="inc-sev"
              value={severity}
              onChange={(event) => setSeverity(event.target.value as IncidentSeverity)}
            >
              <option value="low">low</option>
              <option value="moderate">moderate</option>
              <option value="high">high</option>
              <option value="critical">critical</option>
            </select>
          </FormField>
          <FormField id="inc-sum" label="Summary">
            <textarea
              id="inc-sum"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </FormField>
          <button type="submit" className="btn">
            File on the log
          </button>
        </form>
        <section className="stack">
          {state.incidents.map((incident) => (
            <article key={incident.id} className="card stack">
              <div className="page-head">
                <h2>{incident.title}</h2>
                <StatusPill value={incident.severity} />
              </div>
              <StatusPill value={incident.status} />
              <p>{incident.summary}</p>
              <p className="muted">
                {incident.reportedBy} · {formatStamp(incident.reportedAt)}
              </p>
              <div className="row-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    dispatch({
                      type: 'set-incident-status',
                      id: incident.id,
                      status: 'mitigating',
                      actor,
                    })
                  }
                  disabled={incident.status !== 'open'}
                >
                  Mitigate
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    dispatch({
                      type: 'set-incident-status',
                      id: incident.id,
                      status: 'closed',
                      actor,
                    })
                  }
                  disabled={incident.status === 'closed'}
                >
                  Close
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}
