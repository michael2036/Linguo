import { makeStyles, tokens, shorthands } from '@fluentui/react-components';
import type { LektionStatus } from '../../types/appState';

const LABELS: Record<LektionStatus, string> = {
  red: 'Übungsbedarf',
  yellow: 'In Bearbeitung',
  green: 'Gemeistert',
};

const useStyles = makeStyles({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    ...shorthands.gap('6px'),
    ...shorthands.padding('3px', '10px', '3px', '8px'),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    fontSize: '12px',
    fontWeight: 600,
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: tokens.borderRadiusCircular,
    flexShrink: 0,
  },
  red: {
    backgroundColor: tokens.colorPaletteRedBackground2,
    color: tokens.colorPaletteRedForeground2,
  },
  redDot: { backgroundColor: tokens.colorPaletteRedForeground1 },
  yellow: {
    backgroundColor: tokens.colorPaletteMarigoldBackground2,
    color: tokens.colorPaletteMarigoldForeground2,
  },
  yellowDot: { backgroundColor: tokens.colorPaletteMarigoldForeground1 },
  green: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
    color: tokens.colorPaletteGreenForeground2,
  },
  greenDot: { backgroundColor: tokens.colorPaletteGreenForeground1 },
});

export const TrafficLightBadge = ({ status }: { status: LektionStatus }) => {
  const styles = useStyles();
  const classByStatus = { red: styles.red, yellow: styles.yellow, green: styles.green } as const;
  const dotByStatus = { red: styles.redDot, yellow: styles.yellowDot, green: styles.greenDot } as const;

  return (
    <span className={`${styles.base} ${classByStatus[status]}`}>
      <span className={`${styles.dot} ${dotByStatus[status]}`} />
      {LABELS[status]}
    </span>
  );
};
