import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { ArrowClockwise24Regular, Warning24Filled } from '@fluentui/react-icons';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    ...shorthands.gap('16px'),
    paddingTop: '64px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  icon: {
    color: tokens.colorPaletteRedForeground1,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
    maxWidth: '380px',
  },
});

// Guards the routed app against a crash in any single page (e.g. a
// malformed Modul JSON) turning into a blank white screen. Local progress
// already persisted before the crash is untouched — only this render tree
// resets on reload.
const Fallback = () => {
  const styles = useStyles();
  return (
    <div className={styles.wrap}>
      <Warning24Filled className={styles.icon} fontSize={48} />
      <Text className={styles.title} as="h1" size={700}>
        Etwas ist schiefgelaufen
      </Text>
      <Text className={styles.subtitle}>
        Diese Ansicht konnte nicht geladen werden. Dein gespeicherter Fortschritt ist davon nicht betroffen.
      </Text>
      <Button appearance="primary" icon={<ArrowClockwise24Regular />} onClick={() => window.location.reload()}>
        Seite neu laden
      </Button>
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Linguo crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <Fallback />;
    }
    return this.props.children;
  }
}
