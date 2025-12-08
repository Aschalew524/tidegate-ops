export function LiveRegion({ message }: { message: string }) {
  return (
    <div className="live-region" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  )
}
