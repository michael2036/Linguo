import { Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { CheckmarkCircle24Filled, Fire24Filled, Sparkle24Filled, TrophyFilled } from '@fluentui/react-icons';
import type { VocabTrainerState } from '../../types/appState';
import { XP_PER_LEVEL, levelForXp, xpIntoLevel } from '../../lib/vocabGame';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    ...shorthands.gap('10px'),
    '@media (min-width: 560px)': {
      gridTemplateColumns: 'repeat(4, 1fr)',
    },
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.gap('4px'),
    ...shorthands.padding('14px', '10px'),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorBrandForeground1,
  },
  statValue: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: tokens.fontSizeBase500,
    color: tokens.colorNeutralForeground1,
  },
  statLabel: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
});

interface VocabGameStatsProps {
  trainer: VocabTrainerState;
  masteredCount: number;
  poolSize: number;
}

export const VocabGameStats = ({ trainer, masteredCount, poolSize }: VocabGameStatsProps) => {
  const styles = useStyles();
  const level = levelForXp(trainer.xp);
  const intoLevel = xpIntoLevel(trainer.xp);

  return (
    <div className={styles.grid}>
      <div className={styles.stat}>
        <Sparkle24Filled />
        <Text className={styles.statValue}>Level {level}</Text>
        <Text className={styles.statLabel}>
          {intoLevel}/{XP_PER_LEVEL} XP
        </Text>
      </div>
      <div className={styles.stat}>
        <Fire24Filled />
        <Text className={styles.statValue}>{trainer.dailyStreak}</Text>
        <Text className={styles.statLabel}>Tage in Folge</Text>
      </div>
      <div className={styles.stat}>
        <TrophyFilled />
        <Text className={styles.statValue}>
          {masteredCount}/{poolSize}
        </Text>
        <Text className={styles.statLabel}>Gemeistert</Text>
      </div>
      <div className={styles.stat}>
        <CheckmarkCircle24Filled />
        <Text className={styles.statValue}>{trainer.sessionsCompleted}</Text>
        <Text className={styles.statLabel}>Runden gespielt</Text>
      </div>
    </div>
  );
};
