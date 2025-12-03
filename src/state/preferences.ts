import type { Density, ThemeName } from '../types/harbor.ts'

const THEME_KEY = 'tidegate.theme'
const DENSITY_KEY = 'tidegate.density'

export function readTheme(): ThemeName {
  const stored = window.localStorage.getItem(THEME_KEY)
  return stored === 'light' ? 'light' : 'dark'
}

export function writeTheme(theme: ThemeName): void {
  window.localStorage.setItem(THEME_KEY, theme)
}

export function readDensity(): Density {
  const stored = window.localStorage.getItem(DENSITY_KEY)
  return stored === 'compact' ? 'compact' : 'comfortable'
}

export function writeDensity(density: Density): void {
  window.localStorage.setItem(DENSITY_KEY, density)
}
