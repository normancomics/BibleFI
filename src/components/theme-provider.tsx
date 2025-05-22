
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
  themes?: string[]
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ 
  children, 
  defaultTheme = "dark",
  storageKey = "bible-fi-theme",
  ...props 
}: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
