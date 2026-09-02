import { useState } from 'react';
import {
  Button,
  Card,
  Label,
  MessageBar,
  MessageBarBody,
  RadioGroup,
  Radio,
  Text,
  makeStyles,
  tokens,
  shorthands,
} from '@fluentui/react-components';
import { CloudSync24Regular, PlugDisconnected24Regular } from '@fluentui/react-icons';
import { useAppStore } from '../store/appState';
import type { NativeLanguage, ThemePreference } from '../types/appState';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('20px'),
    maxWidth: '480px',
  },
  section: {
    ...shorthands.padding('16px'),
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
  },
  actionButton: {
    minHeight: '44px',
  },
});

export const SettingsPage = () => {
  const styles = useStyles();
  const preferences = useAppStore((s) => s.state.preferences);
  const setTheme = useAppStore((s) => s.setTheme);
  const setNativeLanguage = useAppStore((s) => s.setNativeLanguage);
  const signedIn = useAppStore((s) => s.signedIn);
  const syncing = useAppStore((s) => s.syncing);
  const syncPending = useAppStore((s) => s.syncPending);
  const lastSyncError = useAppStore((s) => s.lastSyncError);
  const connectGoogle = useAppStore((s) => s.connectGoogle);
  const disconnectGoogle = useAppStore((s) => s.disconnectGoogle);
  const [connectError, setConnectError] = useState<string | null>(null);

  const handleConnect = async () => {
    setConnectError(null);
    try {
      await connectGoogle();
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Verbindung fehlgeschlagen.');
    }
  };

  return (
    <div className={styles.wrap}>
      <Text as="h1" size={700} weight="semibold">
        Einstellungen
      </Text>

      <Card className={styles.section}>
        <Label weight="semibold">Design</Label>
        <RadioGroup
          value={preferences.theme}
          onChange={(_, data) => setTheme(data.value as ThemePreference)}
        >
          <Radio value="system" label="System" />
          <Radio value="light" label="Hell" />
          <Radio value="dark" label="Dunkel" />
        </RadioGroup>
      </Card>

      <Card className={styles.section}>
        <Label weight="semibold">Muttersprache</Label>
        <RadioGroup
          value={preferences.nativeLanguage}
          onChange={(_, data) => setNativeLanguage(data.value as NativeLanguage)}
        >
          <Radio value="es" label="Español" />
          <Radio value="en" label="English" />
        </RadioGroup>
      </Card>

      <Card className={styles.section}>
        <Label weight="semibold">Cloud-Synchronisierung</Label>
        <Text style={{ color: tokens.colorNeutralForeground3 }}>
          Verbindet nur den privaten App-Datenordner deines Google-Kontos (kein Zugriff auf dein
          restliches Drive).
        </Text>
        {connectError && (
          <MessageBar intent="error">
            <MessageBarBody>{connectError}</MessageBarBody>
          </MessageBar>
        )}
        {lastSyncError && !connectError && (
          <MessageBar intent="warning">
            <MessageBarBody>Synchronisierung ausstehend — wird bei Verbindung automatisch wiederholt.</MessageBarBody>
          </MessageBar>
        )}
        {signedIn ? (
          <>
            <MessageBar intent="success">
              <MessageBarBody>
                Verbunden. {syncing ? 'Synchronisiere…' : syncPending ? 'Synchronisierung ausstehend.' : 'Aktuell.'}
              </MessageBarBody>
            </MessageBar>
            <Button
              className={styles.actionButton}
              appearance="outline"
              icon={<PlugDisconnected24Regular />}
              onClick={disconnectGoogle}
            >
              Google-Konto trennen
            </Button>
          </>
        ) : (
          <Button
            className={styles.actionButton}
            appearance="primary"
            icon={<CloudSync24Regular />}
            onClick={handleConnect}
          >
            Mit Google verbinden
          </Button>
        )}
      </Card>
    </div>
  );
};
