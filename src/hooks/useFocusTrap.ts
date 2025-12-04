import { useEffect, useRef } from 'react'

export function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return
    const root = ref.current
    if (!root) return

    const selectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const nodes = () =>
      Array.from(root.querySelectorAll<HTMLElement>(selectors)).filter(
        (node) => !node.hasAttribute('disabled') && node.getAttribute('aria-hidden') !== 'true',
      )

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const first = nodes()[0]
    first?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return
      const focusable = nodes()
      if (focusable.length === 0) return
      const firstNode = focusable[0]
      const lastNode = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault()
        lastNode.focus()
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault()
        firstNode.focus()
      }
    }

    root.addEventListener('keydown', onKeyDown)
    return () => {
      root.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [active])

  return ref
}
