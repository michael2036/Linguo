import { Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { LinguoAvatar } from './LinguoAvatar';
import type { LinguoExpression } from './linguoExpressions';

const useStyles = makeStyles({
  banner: {
    display: 'flex',
    alignItems: 'flex-start',
    ...shorthands.gap('14px'),
    ...shorthands.padding('18px'),
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    animationName: 'ls-fade-up',
    animationDuration: tokens.durationSlower,
    animationTimingFunction: tokens.curveDecelerateMid,
  },
  avatarSlot: {
    flexShrink: 0,
  },
  bubble: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    ...shorthands.padding('14px', '16px'),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: tokens.colorNeutralBackground3,
    '::before': {
      content: '""',
      position: 'absolute',
      left: '-6px',
      top: '18px',
      width: '12px',
      height: '12px',
      backgroundColor: tokens.colorNeutralBackground3,
      transform: 'rotate(45deg)',
      borderRadius: '2px',
    },
  },
  levelTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: tokens.fontSizeBase500,
  },
  tagline: {
    display: 'block',
    marginTop: '4px',
    color: tokens.colorNeutralForeground2,
  },
  progressLine: {
    display: 'block',
    marginTop: '8px',
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorBrandForeground1,
  },
});

interface LinguoLevelBannerProps {
  levelTitle: string;
  tagline: string;
  expression: LinguoExpression;
  progressLabel?: string;
}

// The mascot's "guide" moment: anchors Linguo at the top of a level view
// with a speech bubble that orients the learner before they dive into
// modules — purely presentational, no curriculum content lives here.
export const LinguoLevelBanner = ({ levelTitle, tagline, expression, progressLabel }: LinguoLevelBannerProps) => {
  const styles = useStyles();
  return (
    <div className={styles.banner}>
      <span className={styles.avatarSlot}>
        <LinguoAvatar expression={expression} size={64} animate="pop" />
      </span>
      <div className={styles.bubble}>
        <Text className={styles.levelTitle} as="h2">
          {levelTitle}
        </Text>
        <Text className={styles.tagline}>{tagline}</Text>
        {progressLabel && <Text className={styles.progressLine}>{progressLabel}</Text>}
      </div>
    </div>
  );
};
