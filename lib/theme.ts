'use client'

import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

export const THEME_KEY = 'fitshqip-theme'
const THEME_COLORS: Record<Theme, string> = { dark: '#0a0a0b', light: '#f6f6f7' }

// Vendos temën te <html>, e ruan në këtë pajisje dhe ndryshon ngjyrën e shiritit të shfletuesit.
export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'light') root.setAttribute('data-theme', 'light')
  else root.removeAttribute('data-theme')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // ruajtja mund të jetë e bllokuar (p.sh. modaliteti privat): tema vlen vetëm për seancën
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    setThemeState(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark')
  }, [])

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t)
    setThemeState(t)
  }, [])

  return { theme, setTheme }
}
