export type VesselType =
  | 'cargo'
  | 'ferry'
  | 'fishing'
  | 'tanker'
  | 'tug'
  | 'research'

export type VesselStatus =
  | 'expected'
  | 'inbound'
  | 'alongside'
  | 'departed'
  | 'detained'

export type BerthStatus = 'open' | 'closed' | 'maintenance'

export type MovementType = 'arrival' | 'departure' | 'shift'

export type MovementStatus =
  | 'draft'
  | 'submitted'
  | 'cleared'
  | 'denied'
  | 'completed'

export type InspectionType = 'safety' | 'customs' | 'environment' | 'hull'

export type InspectionStatus = 'queued' | 'in_progress' | 'passed' | 'failed'

export type IncidentSeverity = 'low' | 'moderate' | 'high' | 'critical'

export type IncidentStatus = 'open' | 'mitigating' | 'closed'

export type CrewRole =
  | 'harbor_master'
  | 'pilot'
  | 'inspector'
  | 'linesman'
  | 'mechanic'
  | 'dispatcher'

export type Vessel = {
  id: string
  name: string
  callSign: string
  flag: string
  imo: string
  type: VesselType
  loaMeters: number
  draftMeters: number
  status: VesselStatus
  agent: string
  lastPort: string
  notes: string
}

export type Berth = {
  id: string
  name: string
  quay: string
  maxLoaMeters: number
  maxDraftMeters: number
  status: BerthStatus
  currentVesselId: string | null
  remarks: string
}

export type Movement = {
  id: string
  vesselId: string
  berthId: string
  type: MovementType
  status: MovementStatus
  windowStart: string
  windowEnd: string
  requestedAt: string
  requestedBy: string
  conflictSummary: string | null
  notes: string
}

export type Inspection = {
  id: string
  vesselId: string
  berthId: string | null
  type: InspectionType
  status: InspectionStatus
  scheduledAt: string
  inspectorCrewId: string
  findings: string
}

export type Incident = {
  id: string
  title: string
  severity: IncidentSeverity
  status: IncidentStatus
  berthId: string | null
  vesselId: string | null
  reportedAt: string
  reportedBy: string
  summary: string
}

export type Certification = {
  name: string
  expiresOn: string
}

export type CrewMember = {
  id: string
  name: string
  role: CrewRole
  assignedVesselId: string | null
  certifications: Certification[]
  onDuty: boolean
}

export type ActivityEvent = {
  id: string
  at: string
  actor: string
  message: string
  entityType: 'vessel' | 'berth' | 'movement' | 'inspection' | 'incident' | 'crew'
  entityId: string
}

export type TideSample = {
  atHour: number
  heightMeters: number
  phase: 'flood' | 'slack' | 'ebb'
}

export type ConflictKind = 'hard' | 'soft'

export type MovementConflict = {
  kind: ConflictKind
  code: string
  message: string
}

export type VesselFilters = {
  query: string
  type: VesselType | 'all'
  status: VesselStatus | 'all'
}

export type ThemeName = 'dark' | 'light'
export type Density = 'comfortable' | 'compact'
