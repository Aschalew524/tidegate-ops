import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import {
  createInitialState,
  harborReducer,
  type HarborAction,
  type HarborState,
} from './harborReducer.ts'

type HarborContextValue = {
  state: HarborState
  dispatch: Dispatch<HarborAction>
  now: Date
  actor: string
}

const HarborContext = createContext<HarborContextValue | null>(null)

export function HarborProvider({
  children,
  now,
  actor = 'Jonah Helm',
  initialState,
}: {
  children: ReactNode
  now: Date
  actor?: string
  initialState?: HarborState
}) {
  const reducer = useCallback(
    (state: HarborState, action: HarborAction) => harborReducer(state, action, now),
    [now],
  )
  const [state, dispatch] = useReducer(
    reducer,
    initialState ?? createInitialState(now),
  )

  const value = useMemo(
    () => ({ state, dispatch, now, actor }),
    [state, dispatch, now, actor],
  )

  return <HarborContext.Provider value={value}>{children}</HarborContext.Provider>
}

export function useHarbor(): HarborContextValue {
  const value = useContext(HarborContext)
  if (!value) {
    throw new Error('useHarbor must be used inside HarborProvider')
  }
  return value
}
