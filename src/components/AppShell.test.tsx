import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App.tsx'
import { renderHarbor } from '../test/render.tsx'

describe('app shell', () => {
  it('moves from the watch board to the berth board', async () => {
    const user = userEvent.setup()
    renderHarbor(<App />)
    await screen.findByRole('heading', { name: 'Watch board' })
    await user.click(screen.getByRole('link', { name: 'Berths' }))
    expect(await screen.findByRole('heading', { name: 'Berth board' })).toBeInTheDocument()
    expect(screen.getByText('Grain Jetty')).toBeInTheDocument()
  })
})
