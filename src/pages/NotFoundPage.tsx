import { useNavigate } from 'react-router-dom';
import { Button, Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { ArrowLeft24Regular, CompassNorthwestRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    ...shorthands.gap('16px'),
    paddingTop: '64px',
  },
  icon: {
    color: tokens.colorBrandForeground1,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
    maxWidth: '360px',
  },
});

export const NotFoundPage = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div className={styles.wrap}>
      <CompassNorthwestRegular className={styles.icon} fontSize={48} />
      <Text className={styles.title} as="h1" size={700}>
        Diese Seite gibt es nicht
      </Text>
      <Text className={styles.subtitle}>
        Der Link führt ins Leere. Vielleicht wurde die Lektion verschoben oder existiert nicht mehr.
      </Text>
      <Button appearance="primary" icon={<ArrowLeft24Regular />} onClick={() => navigate('/')}>
        Zurück zur Startseite
      </Button>
    </div>
  );
};
