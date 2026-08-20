import { type ReactNode, useState } from 'react';
import { PROVIDER_IDS, type ArticleCategory, type ProviderId } from '@/features/articles/types';
import { PreferencesContext } from '@/features/preferences/preferencesContext';
import {
  clearPreferences,
  DEFAULT_PREFERENCES,
  hasPreferences,
  readPreferences,
  writePreferences,
  type Preferences,
} from '@/features/preferences/storage';

function addTo(list: readonly string[], value: string): readonly string[] {
  const trimmed = value.trim();
  if (trimmed === '' || list.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
    return list;
  }
  return [...list, trimmed];
}

function removeFrom(list: readonly string[], value: string): readonly string[] {
  return list.filter((item) => item !== value);
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  // Read once on mount; persistence happens in the handlers below, never during
  // render.
  const [preferences, setPreferences] = useState<Preferences>(readPreferences);

  const commit = (next: Preferences) => {
    setPreferences(next);
    writePreferences(next);
  };

  return (
    <PreferencesContext
      value={{
        preferences,
        hasAny: hasPreferences(preferences),
        toggleCategory: (category: ArticleCategory) =>
          commit({
            ...preferences,
            categories: preferences.categories.includes(category)
              ? preferences.categories.filter((item) => item !== category)
              : [...preferences.categories, category],
          }),
        setSources: (sources: readonly ProviderId[]) =>
          commit({
            ...preferences,
            sources: PROVIDER_IDS.filter((id) => sources.includes(id)),
          }),
        addAuthor: (author: string) =>
          commit({ ...preferences, authors: addTo(preferences.authors, author) }),
        removeAuthor: (author: string) =>
          commit({ ...preferences, authors: removeFrom(preferences.authors, author) }),
        reset: () => {
          setPreferences(DEFAULT_PREFERENCES);
          clearPreferences();
        },
      }}
    >
      {children}
    </PreferencesContext>
  );
}
