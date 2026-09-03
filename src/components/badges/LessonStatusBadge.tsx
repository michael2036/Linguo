import type { ReactElement } from 'react';
import { makeStyles, mergeClasses, tokens, shorthands } from '@fluentui/react-components';
import { LockClosed16Regular, BookOpen16Filled, CheckmarkCircle16Filled, Warning16Filled } from '@fluentui/react-icons';
import type { DisplayStatus } from '../../lib/dashboardStatus';

// UI psychology: nothing here is red-by-default. A Lektion nobody has
// touched yet reads as neutral ("not started"), never as a warning — see
// lib/dashboardStatus.ts. Amber/red is reserved for the one case that
// actually earns it: a mastered Lektion Linguo thinks deserves a quick
// second look.
const LABELS: Record<DisplayStatus, string> = {
  unattempted: 'Noch nicht begonnen',
  'in-progress': 'In Bearbeitung',
  completed: 'Gemeistert',
  'needs-review': 'Kurz wiederholen',
};

const ICONS: Record<DisplayStatus, ReactElement> = {
  unattempted: <LockClosed16Regular />,
  'in-progress': <BookOpen16Filled />,
  completed: <CheckmarkCircle16Filled />,
  'needs-review': <Warning16Filled />,
};

const useStyles = makeStyles({
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    ...shorthands.gap('6px'),
    ...shorthands.padding('4px', '10px'),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    fontSize: '12px',
    fontWeight: 600,
  },
  unattempted: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
  },
  inProgress: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  completed: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
    color: tokens.colorPaletteGreenForeground2,
  },
  needsReview: {
    backgroundColor: tokens.colorPaletteMarigoldBackground2,
    color: tokens.colorPaletteMarigoldForeground2,
  },
  node: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    flexShrink: 0,
    borderRadius: tokens.borderRadiusCircular,
    ...shorthands.border('2px', 'solid', 'transparent'),
  },
  nodeUnattempted: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderColor(tokens.colorNeutralStroke2),
    color: tokens.colorNeutralForeground3,
  },
  nodeInProgress: {
    backgroundColor: tokens.colorBrandBackground2,
    ...shorthands.borderColor(tokens.colorBrandStroke1),
    color: tokens.colorBrandForeground1,
  },
  nodeCompleted: {
    backgroundColor: tokens.colorPaletteGreenForeground1,
    ...shorthands.borderColor(tokens.colorPaletteGreenBorder2),
    color: tokens.colorNeutralForegroundOnBrand,
  },
  nodeNeedsReview: {
    backgroundColor: tokens.colorPaletteMarigoldBackground2,
    ...shorthands.borderColor(tokens.colorPaletteMarigoldBorder2),
    color: tokens.colorPaletteMarigoldForeground2,
  },
});

const PILL_CLASS: Record<DisplayStatus, string> = {
  unattempted: 'unattempted',
  'in-progress': 'inProgress',
  completed: 'completed',
  'needs-review': 'needsReview',
};

const NODE_CLASS: Record<DisplayStatus, string> = {
  unattempted: 'nodeUnattempted',
  'in-progress': 'nodeInProgress',
  completed: 'nodeCompleted',
  'needs-review': 'nodeNeedsReview',
};

interface LessonStatusBadgeProps {
  status: DisplayStatus;
}

// Full text pill — used where only one Lektion's status is on screen at a
// time (e.g. the LektionPage header), so the extra label reads as helpful
// context rather than noise.
export const LessonStatusBadge = ({ status }: LessonStatusBadgeProps) => {
  const styles = useStyles();
  return (
    <span className={mergeClasses(styles.pill, styles[PILL_CLASS[status] as keyof typeof styles])}>
      {ICONS[status]}
      {LABELS[status]}
    </span>
  );
};

interface LessonStatusNodeProps {
  status: DisplayStatus;
  className?: string;
}

// Compact icon-only node — used for path rows on the dashboard, where a
// dozen text pills at once would be exactly the density this redesign is
// trying to remove. The icon alone carries the state; `aria-label` covers
// the rest for assistive tech.
export const LessonStatusNode = ({ status, className }: LessonStatusNodeProps) => {
  const styles = useStyles();
  return (
    <span
      role="img"
      aria-label={LABELS[status]}
      className={mergeClasses(styles.node, styles[NODE_CLASS[status] as keyof typeof styles], className)}
    >
      {ICONS[status]}
    </span>
  );
};
