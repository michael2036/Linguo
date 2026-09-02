import { FluentProvider } from '@fluentui/react-components';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useResolvedTheme } from './theme/useSystemTheme';
import { useAppStore } from './store/appState';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { ChapterPage } from './pages/ChapterPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// HashRouter (not BrowserRouter) is deliberate: GitHub Pages serves no
// server-side rewrites, so hash-based routes are the only ones that survive
// a hard refresh or direct link under the repo sub-path (TR-02).
function App() {
  const themePreference = useAppStore((s) => s.state.preferences.theme);
  const theme = useResolvedTheme(themePreference);

  return (
    <FluentProvider theme={theme}>
      <HashRouter>
        <AppShell>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chapter/:chapterId" element={<ChapterPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ErrorBoundary>
        </AppShell>
      </HashRouter>
    </FluentProvider>
  );
}

export default App;
