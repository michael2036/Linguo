import { Card, Text, makeStyles, mergeClasses, tokens, shorthands } from '@fluentui/react-components';
import { ChevronRight20Regular } from '@fluentui/react-icons';
import type { ModulSummary } from '../../types/curriculum';
import type { LektionProgressEntry } from '../../types/appState';
import { emptyLektionProgress } from '../../types/appState';
import { getDisplayStatus } from '../../lib/dashboardStatus';
import { LessonStatusNode } from '../badges/LessonStatusBadge';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
    ...shorthands.padding('20px'),
  },
  modulHeader: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    marginBottom: '10px',
  },
  path: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    ...shorthands.gap('14px'),
  },
  rail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '36px',
    flexShrink: 0,
  },
  connector: {
    width: '2px',
    flex: 1,
    minHeight: '20px',
    backgroundColor: tokens.colorNeutralStroke2,
  },
  connectorDone: {
    backgroundColor: tokens.colorPaletteGreenBorder2,
  },
  lektionButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.gap('10px'),
    ...shorthands.padding('12px', '14px'),
    marginBottom: '10px',
    minHeight: '44px',
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: 'transparent',
    ...shorthands.border('none'),
    textAlign: 'left',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: tokens.durationFaster,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  lektionTitle: {
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chevron: {
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
});

interface ModulPathCardProps {
  modul: ModulSummary;
  progressFor: (lektionId: string) => LektionProgressEntry;
  onSelectLektion: (lektionId: string) => void;
}

// One Modul, rendered as a short vertical path of its Lektionen — mirrors
// the same node+connector language LektionPage already uses for its own
// practice tiers, so the whole app reads as one consistent progression
// metaphor instead of dense list rows.
export const ModulPathCard = ({ modul, progressFor, onSelectLektion }: ModulPathCardProps) => {
  const styles = useStyles();

  return (
    <Card className={styles.card}>
      <Text className={styles.modulHeader}>{`Modul ${modul.modulNumber} · ${modul.title}`}</Text>
      <div className={styles.path}>
        {modul.lektionen.map((lektion, i) => {
          const progress = progressFor(lektion.lektionId) ?? emptyLektionProgress();
          const status = getDisplayStatus(progress);
          const isLast = i === modul.lektionen.length - 1;
          return (
            <div key={lektion.lektionId} className={styles.row}>
              <div className={styles.rail}>
                <LessonStatusNode status={status} />
                {!isLast && (
                  <div
                    className={mergeClasses(styles.connector, status === 'completed' && styles.connectorDone)}
                  />
                )}
              </div>
              <button className={styles.lektionButton} onClick={() => onSelectLektion(lektion.lektionId)}>
                <Text className={styles.lektionTitle}>{`Lektion ${lektion.lektionNumber}: ${lektion.title}`}</Text>
                <ChevronRight20Regular className={styles.chevron} />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
