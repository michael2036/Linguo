import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Button,
  makeStyles,
  shorthands,
  tokens,
  Text,
} from '@fluentui/react-components';
import {
  Home24Regular,
  Home24Filled,
  Settings24Regular,
  Settings24Filled,
  bundleIcon,
} from '@fluentui/react-icons';

const HomeIcon = bundleIcon(Home24Filled, Home24Regular);
const SettingsIcon = bundleIcon(Settings24Filled, Settings24Regular);

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100dvh',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    paddingTop: 'max(12px, env(safe-area-inset-top))',
    paddingBottom: '12px',
    paddingLeft: 'max(16px, env(safe-area-inset-left))',
    paddingRight: 'max(16px, env(safe-area-inset-right))',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  main: {
    flex: 1,
    width: '100%',
    maxWidth: '960px',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: 'max(16px, env(safe-area-inset-left))',
    paddingRight: 'max(16px, env(safe-area-inset-right))',
    paddingTop: '20px',
    // Leave room for the fixed bottom nav on narrow viewports.
    paddingBottom: 'calc(76px + env(safe-area-inset-bottom))',
    '@media (min-width: 768px)': {
      paddingBottom: '32px',
    },
  },
  bottomNav: {
    display: 'flex',
    justifyContent: 'space-around',
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke2),
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    paddingTop: '8px',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.colorNeutralBackground1,
    '@media (min-width: 768px)': {
      display: 'none',
    },
  },
  navButton: {
    minWidth: '44px',
    minHeight: '44px',
  },
  headerNav: {
    display: 'none',
    ...shorthands.gap('8px'),
    '@media (min-width: 768px)': {
      display: 'flex',
    },
  },
});

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const styles = useStyles();
  const location = useLocation();

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text weight="semibold" size={500}>
          LinguaScaffold
        </Text>
        <nav className={styles.headerNav}>
          <Button
            as="a"
            href="#/"
            appearance={location.pathname === '/' ? 'primary' : 'subtle'}
            icon={<HomeIcon />}
          >
            Kapitel
          </Button>
          <Button
            as="a"
            href="#/settings"
            appearance={location.pathname === '/settings' ? 'primary' : 'subtle'}
            icon={<SettingsIcon />}
          >
            Einstellungen
          </Button>
        </nav>
      </header>

      <main className={styles.main}>{children}</main>

      <nav className={styles.bottomNav}>
        <Button
          as="a"
          href="#/"
          className={styles.navButton}
          appearance={location.pathname === '/' ? 'primary' : 'subtle'}
          icon={<HomeIcon />}
          aria-label="Kapitel"
        />
        <Button
          as="a"
          href="#/settings"
          className={styles.navButton}
          appearance={location.pathname === '/settings' ? 'primary' : 'subtle'}
          icon={<SettingsIcon />}
          aria-label="Einstellungen"
        />
      </nav>
    </div>
  );
};
