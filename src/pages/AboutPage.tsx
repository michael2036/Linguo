import { useNavigate } from 'react-router-dom';
import { Button, Card, Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import {
  ArrowLeft24Regular,
  BookOpen24Filled,
  CloudOff24Filled,
  Open16Regular,
  ShieldKeyhole24Filled,
} from '@fluentui/react-icons';

const APP_VERSION = '1.0.0';
const REPO_URL = 'https://github.com/michael2036/linguo';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('20px'),
    maxWidth: '560px',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoMark: {
    width: '48px',
    height: '48px',
    borderRadius: tokens.borderRadiusMedium,
    objectFit: 'cover',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
  },
  version: {
    color: tokens.colorNeutralForeground3,
    fontSize: '13px',
  },
  lead: {
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.6',
  },
  featureGrid: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
  },
  feature: {
    display: 'flex',
    alignItems: 'flex-start',
    ...shorthands.gap('12px'),
    ...shorthands.padding('14px'),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    boxShadow: tokens.shadow2,
  },
  featureIcon: {
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
    marginTop: '2px',
  },
  featureText: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('2px'),
  },
  featureTitle: {
    fontWeight: 600,
  },
  featureBody: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
  },
  linkRow: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap('8px'),
  },
});

export const AboutPage = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div className={styles.wrap}>
      <Button className={styles.backButton} appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate(-1)}>
        Zurück
      </Button>

      <div className={styles.brandRow}>
        <img className={styles.logoMark} src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" />
        <div className={styles.brandText}>
          <Text as="h1" size={700} className={styles.title}>
            Linguo
          </Text>
          <Text className={styles.version}>Version {APP_VERSION}</Text>
        </div>
      </div>

      <Text as="p" className={styles.lead}>
        Linguo ist ein kostenloser, lokaler Begleiter zum Deutschlernen — vom ersten Wort bis C1.
        Jedes Kapitel führt dich vom Wortschatz über gezielte Übungen bis zur freien Anwendung,
        ganz ohne Werbung, Abos oder versteckte Kosten.
      </Text>

      <div className={styles.featureGrid}>
        <Card className={styles.feature}>
          <CloudOff24Filled className={styles.featureIcon} fontSize={22} />
          <div className={styles.featureText}>
            <Text className={styles.featureTitle}>Funktioniert offline</Text>
            <Text className={styles.featureBody}>
              Alle Übungen laufen vollständig auf deinem Gerät — auch im Flugmodus, auch ohne
              Konto.
            </Text>
          </div>
        </Card>
        <Card className={styles.feature}>
          <ShieldKeyhole24Filled className={styles.featureIcon} fontSize={22} />
          <div className={styles.featureText}>
            <Text className={styles.featureTitle}>Deine Daten bleiben bei dir</Text>
            <Text className={styles.featureBody}>
              Fortschritt wird lokal gespeichert. Die optionale Synchronisierung nutzt nur einen
              privaten, versteckten Ordner in deinem eigenen Google Drive.
            </Text>
          </div>
        </Card>
        <Card className={styles.feature}>
          <BookOpen24Filled className={styles.featureIcon} fontSize={22} />
          <div className={styles.featureText}>
            <Text className={styles.featureTitle}>Quelloffen</Text>
            <Text className={styles.featureBody}>
              Code und Lerninhalte sind auf GitHub öffentlich einsehbar.
            </Text>
          </div>
        </Card>
      </div>

      <div className={styles.linkRow}>
        <Button as="a" href={REPO_URL} target="_blank" rel="noreferrer" appearance="outline" icon={<Open16Regular />}>
          GitHub
        </Button>
        <Button as="a" href="#/privacy" appearance="outline">
          Datenschutzerklärung
        </Button>
        <Button as="a" href="#/terms" appearance="outline">
          Nutzungsbedingungen
        </Button>
      </div>
    </div>
  );
};
