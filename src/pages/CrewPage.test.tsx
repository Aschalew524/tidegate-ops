import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App.tsx'
import { renderHarbor } from '../test/render.tsx'

describe('crew board', () => {
  it('shows certificate health for the duty inspector', async () => {
    renderHarbor(<App />, { route: '/crew' })
    expect(await screen.findByRole('heading', { name: 'Crew and certificates' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ruth Nairn' })).toBeInTheDocument()
    expect(screen.getAllByText(/expiring|expired|valid/i).length).toBeGreaterThan(0)
  })
})
