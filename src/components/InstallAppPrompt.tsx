import { useEffect, useState } from 'react';
import { Button, Card, Label, Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { AddSquare24Regular, ArrowDownload24Filled, CheckmarkCircle24Filled, ShareIos24Regular } from '@fluentui/react-icons';

// Chrome/Edge/Android fire this before showing their own install UI; there's
// no official DOM lib type for it yet, so it's declared minimally here.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const isStandaloneDisplay = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  // iOS Safari's own (non-standard) way of reporting "launched from Home
  // Screen" — there's no `display-mode: standalone` support there.
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIOSDevice = (): boolean => {
  const ua = window.navigator.userAgent;
  const iOSUserAgent = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reports its UA as a regular Mac; multi-touch is the tell.
  const iPadOS13Plus = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOSUserAgent || iPadOS13Plus;
};

const useStyles = makeStyles({
  section: {
    ...shorthands.padding('18px'),
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    boxShadow: tokens.shadow2,
  },
  body: {
    color: tokens.colorNeutralForeground3,
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('10px'),
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('10px'),
  },
  stepIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    flexShrink: 0,
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  installedRow: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    color: tokens.colorPaletteGreenForeground1,
    fontWeight: 600,
  },
  actionButton: {
    minHeight: '44px',
    alignSelf: 'flex-start',
  },
});

// Explains and, where the browser supports it, triggers installing Linguo
// as a standalone app: a native install prompt on Chrome/Edge/Android, and
// manual "Add to Home Screen" steps on iOS Safari (which never exposes
// `beforeinstallprompt`).
export const InstallAppPrompt = () => {
  const styles = useStyles();
  const [installed, setInstalled] = useState(isStandaloneDisplay);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  if (installed) {
    return (
      <Card className={styles.section}>
        <Label weight="semibold">Als App installiert</Label>
        <div className={styles.installedRow}>
          <CheckmarkCircle24Filled />
          <Text>Du nutzt Linguo bereits als installierte App.</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles.section}>
      <Label weight="semibold">Als App installieren</Label>
      <Text className={styles.body}>
        Installiere Linguo auf deinem Gerät — startet vom Startbildschirm wie eine native App,
        läuft im Vollbild und funktioniert weiterhin offline.
      </Text>

      {deferredPrompt ? (
        <Button
          className={styles.actionButton}
          appearance="primary"
          icon={<ArrowDownload24Filled />}
          onClick={handleInstallClick}
        >
          Jetzt installieren
        </Button>
      ) : isIOSDevice() ? (
        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepIcon}>
              <ShareIos24Regular />
            </span>
            <Text>In Safari unten auf das Teilen-Symbol tippen.</Text>
          </div>
          <div className={styles.step}>
            <span className={styles.stepIcon}>
              <AddSquare24Regular />
            </span>
            <Text>„Zum Home-Bildschirm“ auswählen und mit „Hinzufügen“ bestätigen.</Text>
          </div>
        </div>
      ) : (
        <Text className={styles.body}>
          Öffne das Menü deines Browsers (meist ⋮ oder ein Symbol in der Adressleiste) und wähle
          „App installieren“ oder „Zum Startbildschirm hinzufügen“.
        </Text>
      )}
    </Card>
  );
};
