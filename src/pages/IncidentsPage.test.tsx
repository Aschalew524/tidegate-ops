import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App.tsx'
import { renderHarbor } from '../test/render.tsx'

describe('incident log', () => {
  it('rejects a title that is too short', async () => {
    const user = userEvent.setup()
    renderHarbor(<App />)
    await user.click(await screen.findByRole('link', { name: 'Incidents' }))
    await screen.findByRole('heading', { name: 'Incident log' })
    await user.type(screen.getByLabelText('Title'), 'short')
    await user.click(screen.getByRole('button', { name: 'File on the log' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/eight characters/i)
  })
})
