import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App.tsx'
import { renderHarbor } from '../test/render.tsx'

describe('inspection queue', () => {
  it('starts a queued inspection from the side panel', async () => {
    const user = userEvent.setup()
    renderHarbor(<App />, { route: '/inspections' })
    expect(await screen.findByRole('heading', { name: 'Inspection queue' })).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: /Select i-harrow-customs/i }))
    const start = screen.getByRole('button', { name: 'Start' })
    expect(start).toBeEnabled()
    await user.click(start)
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Pass' })).toBeEnabled()
  })
})
