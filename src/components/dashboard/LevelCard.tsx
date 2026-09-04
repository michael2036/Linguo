import { Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { CheckmarkCircle16Filled, ChevronRight20Regular } from '@fluentui/react-icons';
import type { LevelInfo } from '../../types/curriculum';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('10px'),
    ...shorthands.padding('22px'),
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: 'pointer',
    textAlign: 'left',
    minHeight: '44px',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: tokens.durationFaster,
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow8,
    },
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: tokens.fontSizeBase600,
  },
  mastered: {
    display: 'flex',
    alignItems: 'center',
    color: tokens.colorPaletteGreenForeground1,
    flexShrink: 0,
  },
  tagline: {
    color: tokens.colorNeutralForeground2,
    fontSize: '13px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '4px',
  },
  progress: {
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
  },
  chevron: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
});

interface LevelCardProps {
  level: LevelInfo;
  masteredCount: number;
  totalCount: number;
  onClick: () => void;
}

// The portal's primary entry point per CEFR level — large, tappable, and
// self-contained (title, one-line pitch, progress) so a learner picks a
// level and lands on its dedicated hub, rather than everything living on
// one crowded page.
export const LevelCard = ({ level, masteredCount, totalCount, onClick }: LevelCardProps) => {
  const styles = useStyles();
  const isMastered = totalCount > 0 && masteredCount === totalCount;

  return (
    <button className={styles.card} onClick={onClick}>
      <div className={styles.headerRow}>
        <Text className={styles.title}>{level.title}</Text>
        {isMastered && <CheckmarkCircle16Filled className={styles.mastered} />}
      </div>
      <Text className={styles.tagline}>{level.tagline}</Text>
      <div className={styles.footer}>
        <Text className={styles.progress}>
          {totalCount > 0 ? `${masteredCount} von ${totalCount} Lektionen gemeistert` : 'Bald verfügbar'}
        </Text>
        <ChevronRight20Regular className={styles.chevron} />
      </div>
    </button>
  );
};
