import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App.tsx'
import { renderHarbor } from '../test/render.tsx'

describe('movement desk', () => {
  it('previews a hard conflict before submit', async () => {
    const user = userEvent.setup()
    renderHarbor(<App />)
    await user.click(await screen.findByRole('link', { name: 'Movements' }))
    expect(await screen.findByRole('heading', { name: 'Movement desk' })).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Vessel'), 'v-hollowmere')
    await user.selectOptions(screen.getByLabelText('Berth'), 'b-south-a')
    expect((await screen.findAllByText(/hard:/i)).length).toBeGreaterThan(0)
  })
})
