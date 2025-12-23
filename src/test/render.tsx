import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { HarborProvider } from '../state/HarborContext.tsx'
import { createInitialState, type HarborState } from '../state/harborReducer.ts'

export const TEST_NOW = new Date('2025-11-20T14:00:00.000Z')

type Extra = {
  route?: string
  state?: HarborState
  now?: Date
}

export function renderHarbor(
  ui: ReactElement,
  options: Extra & Omit<RenderOptions, 'wrapper'> = {},
) {
  const { route = '/', state, now = TEST_NOW, ...renderOptions } = options
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <HarborProvider now={now} initialState={state}>
          {children}
        </HarborProvider>
      </MemoryRouter>
    )
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export { createInitialState }
