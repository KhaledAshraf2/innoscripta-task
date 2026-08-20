import { createContext, use } from 'react';
import type { ArticleCategory, ProviderId } from '@/features/articles/types';
import type { Preferences } from '@/features/preferences/storage';

export type PreferencesController = {
  preferences: Preferences;
  hasAny: boolean;
  toggleCategory: (category: ArticleCategory) => void;
  setSources: (sources: readonly ProviderId[]) => void;
  addAuthor: (author: string) => void;
  removeAuthor: (author: string) => void;
  reset: () => void;
};

export const PreferencesContext = createContext<PreferencesController | null>(null);

export function usePreferences(): PreferencesController {
  const controller = use(PreferencesContext);
  if (controller === null) {
    throw new Error('usePreferences must be used inside <PreferencesProvider>.');
  }
  return controller;
}
