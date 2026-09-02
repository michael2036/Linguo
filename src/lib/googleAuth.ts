// Google Identity Services (GIS) token-model auth, scoped to the app's own
// hidden Drive folder only. No client secret is used or required — see TR-07/TR-08.
//
// IMPORTANT: `GOOGLE_CLIENT_ID` below is a placeholder. Create an OAuth 2.0
// "Web application" client in Google Cloud Console, add this app's GitHub
// Pages origin (and http://localhost:5173 for local dev) to "Authorized
// JavaScript origins", and replace the value before Drive sync can work.
export const GOOGLE_CLIENT_ID = 'REPLACE_WITH_YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com';

export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: { type: string; message?: string }) => void;
          }): TokenClient;
        };
      };
    };
  }
}

interface TokenClient {
  requestAccessToken(overrides?: { prompt?: string }): void;
}

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
}

let scriptLoadPromise: Promise<void> | null = null;
let tokenClient: TokenClient | null = null;

// In-memory only, per TR-10 — never persisted to disk.
let accessToken: string | null = null;
let tokenExpiresAt = 0;

const loadGisScript = (): Promise<void> => {
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
};

const getTokenClient = async (
  onGranted: (token: string, expiresInSeconds: number) => void,
  onError: (message: string) => void,
): Promise<TokenClient> => {
  await loadGisScript();
  if (!window.google) {
    throw new Error('Google Identity Services unavailable');
  }
  if (!tokenClient) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          onError(response.error ?? 'Authorization failed');
          return;
        }
        onGranted(response.access_token, response.expires_in ?? 3600);
      },
      error_callback: (error) => onError(error.message ?? error.type),
    });
  }
  return tokenClient;
};

export const isSignedIn = (): boolean => accessToken !== null && Date.now() < tokenExpiresAt;

export const signOut = (): void => {
  if (accessToken && window.google) {
    // Best-effort revoke; ignore failures.
    fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, { method: 'POST' }).catch(() => {});
  }
  accessToken = null;
  tokenExpiresAt = 0;
};

export const requestSignIn = (): Promise<string> =>
  new Promise((resolve, reject) => {
    getTokenClient(
      (token, expiresInSeconds) => {
        accessToken = token;
        tokenExpiresAt = Date.now() + expiresInSeconds * 1000 - 30_000;
        resolve(token);
      },
      (message) => reject(new Error(message)),
    ).then((client) => client.requestAccessToken({ prompt: '' }));
  });

// Attempts a silent (no-UI) token refresh before a sync call, per TR-10.
// Resolves to null rather than throwing when silent refresh isn't possible,
// so callers can fall back to local-only mode without disrupting the user.
export const getValidAccessToken = async (): Promise<string | null> => {
  if (isSignedIn()) return accessToken;
  try {
    return await new Promise<string>((resolve, reject) => {
      getTokenClient(
        (token, expiresInSeconds) => {
          accessToken = token;
          tokenExpiresAt = Date.now() + expiresInSeconds * 1000 - 30_000;
          resolve(token);
        },
        (message) => reject(new Error(message)),
      ).then((client) => client.requestAccessToken({ prompt: 'none' }));
    });
  } catch {
    return null;
  }
};
