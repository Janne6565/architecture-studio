import { createContext, useContext, type ReactNode } from 'react';
import { useCustomTypes } from '@/hooks/useCustomTypes';

type CustomTypesContextValue = ReturnType<typeof useCustomTypes>;

const CustomTypesContext = createContext<CustomTypesContextValue | null>(null);

export function CustomTypesProvider({ children }: { children: ReactNode }) {
  const value = useCustomTypes();
  return <CustomTypesContext.Provider value={value}>{children}</CustomTypesContext.Provider>;
}

export function useCustomTypesContext(): CustomTypesContextValue {
  const ctx = useContext(CustomTypesContext);
  if (!ctx) throw new Error('useCustomTypesContext must be used within CustomTypesProvider');
  return ctx;
}
