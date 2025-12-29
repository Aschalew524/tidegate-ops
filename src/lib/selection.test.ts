import { describe, expect, it } from 'vitest'
import { preserveHiddenSelection, rangeIds, toggleId } from './selection.ts'

describe('selection helpers', () => {
  it('toggles membership', () => {
    expect(toggleId(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleId(['a', 'b'], 'a')).toEqual(['b'])
  })

  it('builds an inclusive visible range', () => {
    expect(rangeIds(['a', 'b', 'c', 'd'], 'b', 'd')).toEqual(['b', 'c', 'd'])
  })

  it('keeps hidden selected ids when the visible set changes', () => {
    expect(preserveHiddenSelection(['hidden', 'b'], ['a', 'b', 'c'], ['a'])).toEqual([
      'hidden',
      'a',
    ])
  })
})
