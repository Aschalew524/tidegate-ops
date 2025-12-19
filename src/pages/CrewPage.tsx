import { StatusPill } from '../components/StatusPill.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { certificationHealth, worstCertificationHealth } from '../lib/certifications.ts'
import { titleCaseRole } from '../lib/time.ts'
import { useHarbor } from '../state/HarborContext.tsx'

export function CrewPage() {
  const { state, dispatch, now, actor } = useHarbor()
  useDocumentTitle('Crew · Tidegate Ops')

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Crew and certificates</h1>
          <p>Duty flags, assignments, and certificate health for the watch.</p>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {state.crew.map((member) => {
          const health = worstCertificationHealth(member.certifications, now)
          const vessel = state.vessels.find((item) => item.id === member.assignedVesselId)
          return (
            <article key={member.id} className="card stack">
              <div className="page-head">
                <h2>{member.name}</h2>
                <StatusPill value={health} />
              </div>
              <p className="muted">{titleCaseRole(member.role)}</p>
              <p>{vessel ? `Assigned to ${vessel.name}` : 'Unassigned'}</p>
              <ul>
                {member.certifications.map((cert) => (
                  <li key={cert.name}>
                    {cert.name} · <StatusPill value={certificationHealth(cert, now)} />
                  </li>
                ))}
              </ul>
              <div className="row-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    dispatch({
                      type: 'set-crew-duty',
                      id: member.id,
                      onDuty: !member.onDuty,
                      actor,
                    })
                  }
                >
                  {member.onDuty ? 'End duty' : 'Start duty'}
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    dispatch({
                      type: 'assign-crew',
                      id: member.id,
                      vesselId: member.assignedVesselId ? null : state.vessels[0]?.id ?? null,
                      actor,
                    })
                  }
                >
                  {member.assignedVesselId ? 'Clear assignment' : 'Assign first vessel'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
