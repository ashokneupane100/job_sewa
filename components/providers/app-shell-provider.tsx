'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme = 'default' | 'dim' | 'lights-out';
export type AppPersona = 'seeker' | 'employer';

interface AppShellContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  persona: AppPersona;
  setPersona: (persona: AppPersona) => void;
  activeUserId: string;
  setActiveUserId: (id: string) => void;
  seekerUserId: string;
  employerUserId: string;
}

const AppShellContext = createContext<AppShellContextValue | undefined>(undefined);

const DEFAULT_SEEKER_ID = '3';
const DEFAULT_EMPLOYER_ID = '2';

export function AppShellProvider({
  children,
  defaultSeekerId = DEFAULT_SEEKER_ID,
  defaultEmployerId = DEFAULT_EMPLOYER_ID,
}: {
  children: React.ReactNode;
  defaultSeekerId?: string;
  defaultEmployerId?: string;
}) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('rs_theme') as AppTheme | null;
      if (savedTheme === 'default' || savedTheme === 'dim' || savedTheme === 'lights-out') {
        return savedTheme;
      }
    }
    return 'lights-out';
  });

  const [persona, setPersonaState] = useState<AppPersona>(() => {
    if (typeof window !== 'undefined') {
      const savedPersona = localStorage.getItem('rs_persona') as AppPersona | null;
      if (savedPersona === 'seeker' || savedPersona === 'employer') {
        return savedPersona;
      }
    }
    return 'seeker';
  });

  const [activeUserId, setActiveUserIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedUserId = localStorage.getItem('rs_active_user_id');
      if (savedUserId) return savedUserId;
      const savedPersona = localStorage.getItem('rs_persona') as AppPersona | null;
      return savedPersona === 'employer' ? defaultEmployerId : defaultSeekerId;
    }
    return defaultSeekerId;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    try {
      localStorage.setItem('rs_theme', newTheme);
    } catch (e) {
      console.warn(e);
    }
  };

  const setPersona = (newPersona: AppPersona) => {
    setPersonaState(newPersona);
    const newUserId = newPersona === 'employer' ? defaultEmployerId : defaultSeekerId;
    setActiveUserIdState(newUserId);
    try {
      localStorage.setItem('rs_persona', newPersona);
      localStorage.setItem('rs_active_user_id', newUserId);
    } catch (e) {
      console.warn(e);
    }
  };

  const setActiveUserId = (id: string) => {
    setActiveUserIdState(id);
    try {
      localStorage.setItem('rs_active_user_id', id);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <AppShellContext.Provider
      value={{
        theme,
        setTheme,
        persona,
        setPersona,
        activeUserId,
        setActiveUserId,
        seekerUserId: defaultSeekerId,
        employerUserId: defaultEmployerId,
      }}
    >
      {children}
    </AppShellContext.Provider>
  );
}

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error('useAppShell must be used within an AppShellProvider');
  }
  return context;
}

