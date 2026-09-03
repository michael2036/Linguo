import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, makeStyles, mergeClasses, shorthands, tokens, Text } from '@fluentui/react-components';
import {
  Brain24Regular,
  Brain24Filled,
  Home24Regular,
  Home24Filled,
  Settings24Regular,
  Settings24Filled,
  bundleIcon,
} from '@fluentui/react-icons';

const HomeIcon = bundleIcon(Home24Filled, Home24Regular);
const VocabTrainerIcon = bundleIcon(Brain24Filled, Brain24Regular);
const SettingsIcon = bundleIcon(Settings24Filled, Settings24Regular);

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100dvh',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    paddingTop: 'max(12px, env(safe-area-inset-top))',
    paddingBottom: '12px',
    paddingLeft: 'max(20px, env(safe-area-inset-left))',
    paddingRight: 'max(20px, env(safe-area-inset-right))',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 88%, transparent)`,
    backdropFilter: 'blur(10px)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('10px'),
  },
  logoMark: {
    display: 'block',
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusMedium,
    objectFit: 'cover',
    flexShrink: 0,
  },
  wordmark: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  main: {
    flex: 1,
    width: '100%',
    maxWidth: '960px',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: 'max(16px, env(safe-area-inset-left))',
    paddingRight: 'max(16px, env(safe-area-inset-right))',
    paddingTop: '24px',
    // Leave room for the fixed bottom nav on narrow viewports.
    paddingBottom: 'calc(88px + env(safe-area-inset-bottom))',
    '@media (min-width: 768px)': {
      paddingBottom: '40px',
    },
  },
  bottomNav: {
    display: 'flex',
    justifyContent: 'space-around',
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke2),
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    paddingTop: '6px',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 92%, transparent)`,
    backdropFilter: 'blur(10px)',
    '@media (min-width: 768px)': {
      display: 'none',
    },
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.gap('2px'),
    minWidth: '64px',
    minHeight: '44px',
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.padding('4px', '10px'),
    color: tokens.colorNeutralForeground3,
    backgroundColor: 'transparent',
    ...shorthands.border('none'),
    textDecorationLine: 'none',
    cursor: 'pointer',
    transitionProperty: 'color, background-color',
    transitionDuration: tokens.durationFaster,
  },
  navItemActive: {
    color: tokens.colorBrandForeground1,
    backgroundColor: tokens.colorBrandBackground2,
  },
  navLabel: {
    fontSize: '11px',
    fontWeight: 600,
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

  const isHome = location.pathname === '/' || location.pathname.startsWith('/lektion');
  const isVocabTrainer = location.pathname.startsWith('/vocab-trainer');
  const isSettings = location.pathname === '/settings';

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img className={styles.logoMark} src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" />
          <Text className={styles.wordmark} size={500}>
            Linguo
          </Text>
        </div>
        <nav className={styles.headerNav}>
          <Button as="a" href="#/" appearance={isHome ? 'primary' : 'subtle'} icon={<HomeIcon />}>
            Lektionen
          </Button>
          <Button
            as="a"
            href="#/vocab-trainer"
            appearance={isVocabTrainer ? 'primary' : 'subtle'}
            icon={<VocabTrainerIcon />}
          >
            Wortschatz
          </Button>
          <Button as="a" href="#/settings" appearance={isSettings ? 'primary' : 'subtle'} icon={<SettingsIcon />}>
            Einstellungen
          </Button>
        </nav>
      </header>

      <main className={styles.main}>{children}</main>

      <nav className={styles.bottomNav}>
        <a href="#/" className={mergeClasses(styles.navItem, isHome && styles.navItemActive)}>
          <HomeIcon />
          <span className={styles.navLabel}>Lektionen</span>
        </a>
        <a href="#/vocab-trainer" className={mergeClasses(styles.navItem, isVocabTrainer && styles.navItemActive)}>
          <VocabTrainerIcon />
          <span className={styles.navLabel}>Wortschatz</span>
        </a>
        <a href="#/settings" className={mergeClasses(styles.navItem, isSettings && styles.navItemActive)}>
          <SettingsIcon />
          <span className={styles.navLabel}>Einstellungen</span>
        </a>
      </nav>
    </div>
  );
};
