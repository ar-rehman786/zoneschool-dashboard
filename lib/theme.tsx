'use client'

import { createContext, useContext } from 'react'

export interface Theme {
  bg: string
  card: string
  cardBorder: string
  cardShadow: string
  text: string
  textMuted: string
  textDim: string
  body: string
  sidebarBg: string
  isDark: boolean
}

export const lightTheme: Theme = {
  bg: '#FAFAF8',
  card: '#FFFFFF',
  cardBorder: 'rgba(30,36,48,0.06)',
  cardShadow: '0 1px 3px rgba(30,36,48,0.04), 0 6px 20px rgba(30,36,48,0.05)',
  text: '#1E2430',
  textMuted: '#64748B',
  textDim: '#9AA4B5',
  body: '#374151',
  sidebarBg: '#1E2430',
  isDark: false,
}

export const darkTheme: Theme = {
  bg: '#0F1219',
  card: '#1A1F2E',
  cardBorder: 'rgba(255,255,255,0.06)',
  cardShadow: '0 1px 3px rgba(0,0,0,0.3), 0 6px 20px rgba(0,0,0,0.4)',
  text: '#E2E8F0',
  textMuted: '#94A3B8',
  textDim: '#64748B',
  body: '#CBD5E1',
  sidebarBg: '#0A0D14',
  isDark: true,
}

const ThemeContext = createContext<Theme>(lightTheme)

export function ThemeProvider({ dark, children }: { dark: boolean; children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={dark ? darkTheme : lightTheme}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): Theme {
  return useContext(ThemeContext)
}
