// Direct fetch calls against the Google Drive REST API v3, scoped entirely to
// the hidden `appDataFolder` (see TR-08/TR-09). The app never touches any
// other part of the user's Drive.
import type { AppState } from '../types/appState';
import { getValidAccessToken } from './googleAuth';

const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const STATE_FILENAME = 'app_state.json';

interface DriveFile {
  id: string;
  name: string;
}

const findStateFile = async (accessToken: string): Promise<DriveFile | null> => {
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    q: `name = '${STATE_FILENAME}'`,
    fields: 'files(id, name)',
    pageSize: '1',
  });
  const res = await fetch(`${DRIVE_FILES_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Drive list failed: ${res.status}`);
  const data = (await res.json()) as { files?: DriveFile[] };
  return data.files?.[0] ?? null;
};

const downloadStateFile = async (accessToken: string, fileId: string): Promise<AppState> => {
  const res = await fetch(`${DRIVE_FILES_URL}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Drive download failed: ${res.status}`);
  return (await res.json()) as AppState;
};

const createStateFile = async (accessToken: string, state: AppState): Promise<void> => {
  const boundary = 'linguascaffold-boundary';
  const metadata = { name: STATE_FILENAME, parents: ['appDataFolder'] };
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(state)}\r\n` +
    `--${boundary}--`;

  const res = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=multipart`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  if (!res.ok) throw new Error(`Drive create failed: ${res.status}`);
};

const updateStateFile = async (accessToken: string, fileId: string, state: AppState): Promise<void> => {
  const res = await fetch(`${DRIVE_UPLOAD_URL}/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(state),
  });
  if (!res.ok) throw new Error(`Drive update failed: ${res.status}`);
};

export interface SyncResult {
  ok: boolean;
  resolvedState?: AppState;
  error?: string;
}

// Pulls remote state (if any), applies last-write-wins by `updatedAt`
// (FR-07), and pushes the winning state back so both sides converge.
export const syncAppState = async (localState: AppState): Promise<SyncResult> => {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return { ok: false, error: 'no-auth' };
  }

  try {
    const existing = await findStateFile(accessToken);

    if (!existing) {
      await createStateFile(accessToken, localState);
      return { ok: true, resolvedState: localState };
    }

    const remoteState = await downloadStateFile(accessToken, existing.id);
    const remoteIsNewer = new Date(remoteState.updatedAt).getTime() > new Date(localState.updatedAt).getTime();
    const resolvedState = remoteIsNewer ? remoteState : localState;

    if (!remoteIsNewer) {
      await updateStateFile(accessToken, existing.id, localState);
    }

    return { ok: true, resolvedState };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown-error' };
  }
};
