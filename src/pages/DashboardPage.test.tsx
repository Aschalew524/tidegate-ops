import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App.tsx'
import { renderHarbor } from '../test/render.tsx'

describe('dashboard', () => {
  it('renders the watch board and occupancy', async () => {
    renderHarbor(<App />)
    expect(await screen.findByRole('heading', { name: 'Watch board' })).toBeInTheDocument()
    expect(screen.getByText('Ashford Reach live picture for the duty dispatcher.')).toBeInTheDocument()
    expect(screen.getByText('Alongside')).toBeInTheDocument()
  })
})
