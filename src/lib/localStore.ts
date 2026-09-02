import type { AppState } from '../types/appState';

const STORAGE_KEY = 'linguascaffold:app-state:v1';

export const loadLocalState = (): AppState | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
};

export const saveLocalState = (state: AppState): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private browsing quota, etc). Fail silently per FR-05.
  }
};

const PENDING_SYNC_KEY = 'linguascaffold:sync-pending:v1';

export const getSyncPending = (): boolean =>
  window.localStorage.getItem(PENDING_SYNC_KEY) === '1';

export const setSyncPending = (pending: boolean): void => {
  try {
    if (pending) {
      window.localStorage.setItem(PENDING_SYNC_KEY, '1');
    } else {
      window.localStorage.removeItem(PENDING_SYNC_KEY);
    }
  } catch {
    // ignore
  }
};
