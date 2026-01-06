import { describe, expect, it } from 'vitest'
import { createInitialState, harborReducer } from '../state/harborReducer.ts'

const NOW = new Date('2025-11-20T14:00:00.000Z')

describe('harborReducer', () => {
  it('denies a movement that cannot physically fit', () => {
    const state = createInitialState(NOW)
    const next = harborReducer(
      state,
      {
        type: 'submit-movement',
        input: {
          vesselId: 'v-hollowmere',
          berthId: 'b-south-a',
          type: 'arrival',
          windowStart: '2025-11-21T10:00:00.000Z',
          windowEnd: '2025-11-21T12:00:00.000Z',
          notes: 'too long',
          actor: 'test',
        },
      },
      NOW,
    )
    expect(next.movements[0]?.status).toBe('denied')
    expect(next.announcement.toLowerCase()).toContain('denied')
  })

  it('keeps hidden vessel selection when the filter changes', () => {
    let state = createInitialState(NOW)
    const visible = state.vessels.map((item) => item.id)
    state = harborReducer(state, {
      type: 'toggle-vessel',
      id: 'v-mothlight',
      visibleIds: visible,
      shift: false,
    })
    state = harborReducer(state, {
      type: 'set-vessel-filters',
      filters: { type: 'cargo' },
    })
    expect(state.selectedVesselIds).toContain('v-mothlight')
  })

  it('detains a vessel when an inspection fails', () => {
    const state = createInitialState(NOW)
    const next = harborReducer(
      state,
      {
        type: 'transition-inspection',
        id: 'i-willow-hull',
        status: 'failed',
        findings: 'plate wastage',
        actor: 'inspector',
      },
      NOW,
    )
    expect(next.vessels.find((item) => item.id === 'v-willowferry')?.status).toBe('detained')
  })

  it('moves a vessel alongside when a cleared arrival completes', () => {
    let state = createInitialState(NOW)
    state = harborReducer(state, {
      type: 'complete-movement',
      id: 'm-harrow-arr',
      actor: 'pilot',
    }, NOW)
    expect(state.vessels.find((item) => item.id === 'v-harrowfen')?.status).toBe('alongside')
    expect(state.berths.find((item) => item.id === 'b-grain')?.currentVesselId).toBe('v-harrowfen')
  })
})
