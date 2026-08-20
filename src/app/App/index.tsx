import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { QueryProvider } from '@/app/QueryProvider';
import { RootLayout } from '@/app/RootLayout';
import { ThemeProvider } from '@/app/ThemeProvider';
import { PreferencesProvider } from '@/features/preferences/PreferencesContext';
import { AllNewsPage } from '@/pages/AllNewsPage';
import { ForYouPage } from '@/pages/ForYouPage';
import { PreferencesPage } from '@/pages/PreferencesPage';

export function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <PreferencesProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<RootLayout />}>
                <Route index element={<AllNewsPage />} />
                <Route path="for-you" element={<ForYouPage />} />
                <Route path="preferences" element={<PreferencesPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </PreferencesProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
