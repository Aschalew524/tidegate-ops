import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App.tsx'
import { renderHarbor } from '../test/render.tsx'

describe('vessel register', () => {
  it('filters the table by search and keeps the count honest', async () => {
    const user = userEvent.setup()
    renderHarbor(<App />, { route: '/vessels' })
    expect(await screen.findByRole('heading', { name: 'Vessel register' })).toBeInTheDocument()
    await user.type(screen.getByLabelText('Search'), 'Mothlight')
    await waitFor(() => {
      expect(screen.getByText('FV Mothlight')).toBeInTheDocument()
      expect(screen.queryByText('MV Cinderwell')).not.toBeInTheDocument()
    })
  })

  it('selects a row from the register', async () => {
    const user = userEvent.setup()
    renderHarbor(<App />, { route: '/vessels' })
    await screen.findByRole('heading', { name: 'Vessel register' })
    await user.click(screen.getByRole('checkbox', { name: /Select v-cinderwell/i }))
    expect(screen.getByText(/1 selected/)).toBeInTheDocument()
  })
})
