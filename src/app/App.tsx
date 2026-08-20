import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { createQueryClient } from '@/app/queryClient';
import { RootLayout } from '@/app/RootLayout';
import { theme } from '@/app/theme';
import { PreferencesProvider } from '@/features/preferences/PreferencesProvider';
import { AllNewsPage } from '@/pages/AllNewsPage';
import { ForYouPage } from '@/pages/ForYouPage';
import { PreferencesPage } from '@/pages/PreferencesPage';

export function App() {
  // One client per app instance, created lazily so StrictMode's double render
  // does not throw away a warm cache.
  const [queryClient] = useState(createQueryClient);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
