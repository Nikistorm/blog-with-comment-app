import { createContext, useContext, useState, ReactNode } from 'react';

interface ComponentLoadingContextType {
  isComponentLoading: boolean;
  startComponentLoading: () => void;
  stopComponentLoading: () => void;
}

const ComponentLoadingContext = createContext<ComponentLoadingContextType | undefined>(undefined);

export function ComponentLoadingProvider({ children }: { children: ReactNode }) {
  const [isComponentLoading, setIsComponentLoading] = useState(false);

  const startComponentLoading = () => setIsComponentLoading(true);
  const stopComponentLoading = () => setIsComponentLoading(false);

  return (
    <ComponentLoadingContext.Provider value={{ isComponentLoading, startComponentLoading, stopComponentLoading }}>
      {children}
    </ComponentLoadingContext.Provider>
  );
}

export function useComponentLoading() {
  const context = useContext(ComponentLoadingContext);
  if (context === undefined) {
    throw new Error('useComponentLoading must be used within a ComponentLoadingProvider');
  }
  return context;
}
