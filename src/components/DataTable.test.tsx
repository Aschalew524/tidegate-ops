import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { DataTable } from './DataTable.tsx'

function Harness() {
  const [selected, setSelected] = useState<string[]>([])
  const rows = [
    { id: 'a', name: 'Alpha' },
    { id: 'b', name: 'Bravo' },
    { id: 'c', name: 'Charlie' },
  ]
  return (
    <DataTable
      rows={rows}
      getRowId={(row) => row.id}
      caption="demo"
      selectedIds={selected}
      onToggle={(id) =>
        setSelected((current) =>
          current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        )
      }
      onToggleAll={(checked) => setSelected(checked ? rows.map((row) => row.id) : [])}
      columns={[
        {
          id: 'name',
          header: 'Name',
          sortValue: (row) => row.name,
          render: (row) => row.name,
        },
      ]}
    />
  )
}

describe('DataTable', () => {
  it('sorts when the column header is activated', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: /Name/ }))
    const cells = screen.getAllByRole('cell').map((cell) => cell.textContent)
    expect(cells.join(' ')).toContain('Alpha')
  })

  it('selects every visible row from the header checkbox', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('checkbox', { name: 'Select all rows' }))
    expect(screen.getByRole('checkbox', { name: 'Select a' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Select c' })).toBeChecked()
  })
})
