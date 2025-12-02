import { createHarborRecords } from '../data/seed.ts'
import {
  applyInspectionToVessel,
  canTransitionInspection,
} from '../lib/inspections.ts'
import {
  evaluateMovement,
  hardConflicts,
  summarizeConflicts,
} from '../lib/conflicts.ts'
import { preserveHiddenSelection, rangeIds, toggleId } from '../lib/selection.ts'
import type {
  ActivityEvent,
  CrewMember,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  Inspection,
  InspectionStatus,
  Movement,
  MovementStatus,
  MovementType,
  VesselFilters,
} from '../types/harbor.ts'

export type HarborState = ReturnType<typeof createHarborRecords> & {
  vesselFilters: VesselFilters
  selectedVesselIds: string[]
  lastClickedVesselId: string | null
  selectedMovementIds: string[]
  announcement: string
  idSeq: number
}

export type HarborAction =
  | { type: 'set-vessel-filters'; filters: Partial<VesselFilters> }
  | { type: 'toggle-vessel'; id: string; visibleIds: string[]; shift: boolean }
  | { type: 'select-all-visible-vessels'; visibleIds: string[]; selected: boolean }
  | { type: 'clear-vessel-selection' }
  | {
      type: 'submit-movement'
      input: {
        vesselId: string
        berthId: string
        type: MovementType
        windowStart: string
        windowEnd: string
        notes: string
        actor: string
      }
    }
  | { type: 'set-movement-status'; id: string; status: MovementStatus; actor: string }
  | { type: 'complete-movement'; id: string; actor: string }
  | { type: 'toggle-movement'; id: string }
  | { type: 'transition-inspection'; id: string; status: InspectionStatus; findings?: string; actor: string }
  | {
      type: 'file-incident'
      input: {
        title: string
        severity: IncidentSeverity
        berthId: string | null
        vesselId: string | null
        summary: string
        actor: string
      }
    }
  | { type: 'set-incident-status'; id: string; status: IncidentStatus; actor: string }
  | { type: 'set-crew-duty'; id: string; onDuty: boolean; actor: string }
  | { type: 'assign-crew'; id: string; vesselId: string | null; actor: string }
  | { type: 'clear-announcement' }

export function createInitialState(now: Date): HarborState {
  const records = createHarborRecords(now)
  return {
    ...records,
    vesselFilters: { query: '', type: 'all', status: 'all' },
    selectedVesselIds: [],
    lastClickedVesselId: null,
    selectedMovementIds: [],
    announcement: 'Tidegate operations board is live.',
    idSeq: 100,
  }
}

function nextId(state: HarborState, prefix: string): { id: string; idSeq: number } {
  const idSeq = state.idSeq + 1
  return { id: `${prefix}-${idSeq}`, idSeq }
}

function log(
  state: HarborState,
  actor: string,
  message: string,
  entityType: ActivityEvent['entityType'],
  entityId: string,
  nowIso: string,
): { activities: ActivityEvent[]; announcement: string; idSeq: number } {
  const { id, idSeq } = nextId(state, 'a')
  const event: ActivityEvent = { id, at: nowIso, actor, message, entityType, entityId }
  return {
    activities: [event, ...state.activities].slice(0, 40),
    announcement: message,
    idSeq,
  }
}

function applyMovementCompletion(state: HarborState, movement: Movement): HarborState {
  const vessel = state.vessels.find((item) => item.id === movement.vesselId)
  if (!vessel) return state

  let vessels = state.vessels
  let berths = state.berths

  if (movement.type === 'arrival' || movement.type === 'shift') {
    vessels = vessels.map((item) =>
      item.id === vessel.id ? { ...item, status: 'alongside' } : item,
    )
    berths = berths.map((berth) => {
      if (berth.currentVesselId === vessel.id) {
        return { ...berth, currentVesselId: null }
      }
      if (berth.id === movement.berthId) {
        return { ...berth, currentVesselId: vessel.id }
      }
      return berth
    })
  }

  if (movement.type === 'departure') {
    vessels = vessels.map((item) =>
      item.id === vessel.id ? { ...item, status: 'departed' } : item,
    )
    berths = berths.map((berth) =>
      berth.id === movement.berthId ? { ...berth, currentVesselId: null } : berth,
    )
  }

  return { ...state, vessels, berths }
}

export function harborReducer(
  state: HarborState,
  action: HarborAction,
  now: Date = new Date(),
): HarborState {
  const nowIso = now.toISOString()

  switch (action.type) {
    case 'set-vessel-filters':
      return {
        ...state,
        vesselFilters: { ...state.vesselFilters, ...action.filters },
      }
    case 'toggle-vessel': {
      if (action.shift && state.lastClickedVesselId) {
        const range = rangeIds(action.visibleIds, state.lastClickedVesselId, action.id)
        return {
          ...state,
          selectedVesselIds: preserveHiddenSelection(
            state.selectedVesselIds,
            action.visibleIds,
            range,
          ),
          lastClickedVesselId: action.id,
        }
      }
      const visibleSelection = toggleId(
        state.selectedVesselIds.filter((id) => action.visibleIds.includes(id)),
        action.id,
      )
      return {
        ...state,
        selectedVesselIds: preserveHiddenSelection(
          state.selectedVesselIds,
          action.visibleIds,
          visibleSelection,
        ),
        lastClickedVesselId: action.id,
      }
    }
    case 'select-all-visible-vessels': {
      const nextVisible = action.selected ? action.visibleIds : []
      return {
        ...state,
        selectedVesselIds: preserveHiddenSelection(
          state.selectedVesselIds,
          action.visibleIds,
          nextVisible,
        ),
      }
    }
    case 'clear-vessel-selection':
      return { ...state, selectedVesselIds: [], lastClickedVesselId: null }
    case 'toggle-movement':
      return {
        ...state,
        selectedMovementIds: toggleId(state.selectedMovementIds, action.id),
      }
    case 'submit-movement': {
      const { id, idSeq } = nextId(state, 'm')
      const draft: Movement = {
        id,
        vesselId: action.input.vesselId,
        berthId: action.input.berthId,
        type: action.input.type,
        status: 'draft',
        windowStart: action.input.windowStart,
        windowEnd: action.input.windowEnd,
        requestedAt: nowIso,
        requestedBy: action.input.actor,
        conflictSummary: null,
        notes: action.input.notes,
      }
      const conflicts = evaluateMovement(draft, state)
      const hard = hardConflicts(conflicts)
      const submitted: Movement = {
        ...draft,
        status: hard.length > 0 ? 'denied' : 'submitted',
        conflictSummary: summarizeConflicts(conflicts),
      }
      const logged = log(
        { ...state, idSeq },
        action.input.actor,
        hard.length > 0
          ? `Denied ${submitted.type} for ${submitted.vesselId}: ${submitted.conflictSummary}`
          : `Submitted ${submitted.type} ${submitted.id}.`,
        'movement',
        submitted.id,
        nowIso,
      )
      return {
        ...state,
        idSeq: logged.idSeq,
        movements: [submitted, ...state.movements],
        activities: logged.activities,
        announcement: logged.announcement,
      }
    }
    case 'set-movement-status': {
      const current = state.movements.find((item) => item.id === action.id)
      if (!current) return state
      if (action.status === 'cleared') {
        const conflicts = hardConflicts(evaluateMovement({ ...current, status: 'cleared' }, state))
        if (conflicts.length > 0) {
          const logged = log(
            state,
            action.actor,
            `Could not clear ${current.id}: ${summarizeConflicts(conflicts)}`,
            'movement',
            current.id,
            nowIso,
          )
          return {
            ...state,
            idSeq: logged.idSeq,
            activities: logged.activities,
            announcement: logged.announcement,
          }
        }
      }
      const movements = state.movements.map((item) =>
        item.id === action.id ? { ...item, status: action.status } : item,
      )
      const logged = log(
        state,
        action.actor,
        `Movement ${action.id} marked ${action.status}.`,
        'movement',
        action.id,
        nowIso,
      )
      return {
        ...state,
        movements,
        idSeq: logged.idSeq,
        activities: logged.activities,
        announcement: logged.announcement,
      }
    }
    case 'complete-movement': {
      const current = state.movements.find((item) => item.id === action.id)
      if (!current || current.status !== 'cleared') return state
      const completed: Movement = { ...current, status: 'completed' }
      const withMovement: HarborState = {
        ...state,
        movements: state.movements.map((item) => (item.id === current.id ? completed : item)),
      }
      const next = applyMovementCompletion(withMovement, completed)
      const logged = log(
        next,
        action.actor,
        `Completed ${current.type} for ${current.vesselId} on ${current.berthId}.`,
        'movement',
        current.id,
        nowIso,
      )
      return {
        ...next,
        idSeq: logged.idSeq,
        activities: logged.activities,
        announcement: logged.announcement,
      }
    }
    case 'transition-inspection': {
      const current = state.inspections.find((item) => item.id === action.id)
      if (!current) return state
      if (!canTransitionInspection(current.status, action.status)) return state
      const updated: Inspection = {
        ...current,
        status: action.status,
        findings: action.findings ?? current.findings,
      }
      let vessels = state.vessels
      if (action.status === 'passed' || action.status === 'failed') {
        vessels = vessels.map((vessel) =>
          vessel.id === updated.vesselId ? applyInspectionToVessel(vessel, updated) : vessel,
        )
      }
      const inspections = state.inspections.map((item) =>
        item.id === updated.id ? updated : item,
      )
      const logged = log(
        state,
        action.actor,
        `Inspection ${updated.id} ${updated.status}.`,
        'inspection',
        updated.id,
        nowIso,
      )
      return {
        ...state,
        inspections,
        vessels,
        idSeq: logged.idSeq,
        activities: logged.activities,
        announcement: logged.announcement,
      }
    }
    case 'file-incident': {
      const { id, idSeq } = nextId(state, 'n')
      const incident: Incident = {
        id,
        title: action.input.title,
        severity: action.input.severity,
        status: 'open',
        berthId: action.input.berthId,
        vesselId: action.input.vesselId,
        reportedAt: nowIso,
        reportedBy: action.input.actor,
        summary: action.input.summary,
      }
      const logged = log(
        { ...state, idSeq },
        action.input.actor,
        `Filed incident ${incident.title}.`,
        'incident',
        incident.id,
        nowIso,
      )
      return {
        ...state,
        idSeq: logged.idSeq,
        incidents: [incident, ...state.incidents],
        activities: logged.activities,
        announcement: logged.announcement,
      }
    }
    case 'set-incident-status': {
      const incidents = state.incidents.map((item) =>
        item.id === action.id ? { ...item, status: action.status } : item,
      )
      const logged = log(
        state,
        action.actor,
        `Incident ${action.id} marked ${action.status}.`,
        'incident',
        action.id,
        nowIso,
      )
      return {
        ...state,
        incidents,
        idSeq: logged.idSeq,
        activities: logged.activities,
        announcement: logged.announcement,
      }
    }
    case 'set-crew-duty': {
      const crew = state.crew.map((member) =>
        member.id === action.id ? { ...member, onDuty: action.onDuty } : member,
      )
      const logged = log(
        state,
        action.actor,
        `${action.onDuty ? 'Set' : 'Cleared'} duty flag for ${action.id}.`,
        'crew',
        action.id,
        nowIso,
      )
      return {
        ...state,
        crew,
        idSeq: logged.idSeq,
        activities: logged.activities,
        announcement: logged.announcement,
      }
    }
    case 'assign-crew': {
      const crew: CrewMember[] = state.crew.map((member) =>
        member.id === action.id ? { ...member, assignedVesselId: action.vesselId } : member,
      )
      const logged = log(
        state,
        action.actor,
        action.vesselId
          ? `Assigned ${action.id} to ${action.vesselId}.`
          : `Cleared assignment for ${action.id}.`,
        'crew',
        action.id,
        nowIso,
      )
      return {
        ...state,
        crew,
        idSeq: logged.idSeq,
        activities: logged.activities,
        announcement: logged.announcement,
      }
    }
    case 'clear-announcement':
      return { ...state, announcement: '' }
    default:
      return state
  }
}
