import type { AppState } from '../types/appState';
import { createInitialAppState } from '../types/appState';

// Bumped to v2 alongside the AppState schema change (chapterProgress ->
// lektionProgress, added Test tracking) -- old v1 data is a different shape
// and would crash the new reducers if read back in, so it's intentionally
// orphaned rather than migrated.
const STORAGE_KEY = 'linguascaffold:app-state:v2';

export const loadLocalState = (): AppState | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    // Backfills any top-level field added to AppState after this user's data
    // was last saved (e.g. `vocabTrainer`) with its default, rather than
    // requiring a version bump for every additive change.
    return { ...createInitialAppState(), ...parsed };
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
