import { useState } from 'react';
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
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
import {
  ArrowResetRegular,
  ChevronRight16Regular,
  CloudSync24Regular,
  Info24Regular,
  PlugDisconnected24Regular,
} from '@fluentui/react-icons';
import { useAppStore } from '../store/appState';
import type { NativeLanguage, ThemePreference } from '../types/appState';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('20px'),
    maxWidth: '480px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
  },
  section: {
    ...shorthands.padding('18px'),
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    boxShadow: tokens.shadow2,
  },
  actionButton: {
    minHeight: '44px',
  },
  dangerButton: {
    minHeight: '44px',
    color: tokens.colorPaletteRedForeground1,
    ...shorthands.borderColor(tokens.colorPaletteRedBorder2),
  },
  aboutRow: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('10px'),
    ...shorthands.padding('8px', '2px'),
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
    textDecorationLine: 'none',
    cursor: 'pointer',
    minHeight: '44px',
    ':hover': {
      color: tokens.colorBrandForeground1,
    },
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
  const resetProgress = useAppStore((s) => s.resetProgress);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

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
      <Text as="h1" size={700} className={styles.title}>
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

      <Card className={styles.section}>
        <Label weight="semibold">Fortschritt</Label>
        <Text style={{ color: tokens.colorNeutralForeground3 }}>
          Setzt den Lernfortschritt aller Lektionen und Vokabeln zurück. Design und Muttersprache
          bleiben unverändert.
        </Text>
        <Dialog open={resetDialogOpen} onOpenChange={(_, data) => setResetDialogOpen(data.open)}>
          <DialogTrigger disableButtonEnhancement>
            <Button className={styles.dangerButton} appearance="outline" icon={<ArrowResetRegular />}>
              Fortschritt zurücksetzen
            </Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>Fortschritt wirklich zurücksetzen?</DialogTitle>
              <DialogContent>
                Alle Vokabel- und Lektionsfortschritte werden dauerhaft gelöscht. Diese Aktion kann
                nicht rückgängig gemacht werden.
              </DialogContent>
              <DialogActions>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="secondary">Abbrechen</Button>
                </DialogTrigger>
                <Button
                  appearance="primary"
                  className={styles.dangerButton}
                  onClick={() => {
                    resetProgress();
                    setResetDialogOpen(false);
                  }}
                >
                  Ja, zurücksetzen
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </Card>

      <Card className={styles.section}>
        <Label weight="semibold">Über</Label>
        <a className={styles.aboutRow} href="#/about">
          <Info24Regular />
          <span style={{ flex: 1 }}>Über Linguo</span>
          <ChevronRight16Regular />
        </a>
        <a className={styles.aboutRow} href="#/privacy">
          <span style={{ width: 24 }} />
          <span style={{ flex: 1 }}>Datenschutzerklärung</span>
          <ChevronRight16Regular />
        </a>
        <a className={styles.aboutRow} href="#/terms">
          <span style={{ width: 24 }} />
          <span style={{ flex: 1 }}>Nutzungsbedingungen</span>
          <ChevronRight16Regular />
        </a>
      </Card>
    </div>
  );
};
