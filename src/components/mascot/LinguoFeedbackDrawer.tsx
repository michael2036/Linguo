import { useMemo } from 'react';
import { Button, Text, makeStyles, mergeClasses, tokens, shorthands } from '@fluentui/react-components';
import { CheckmarkCircle24Filled, HeartFilled } from '@fluentui/react-icons';
import { LinguoAvatar } from './LinguoAvatar';
import { pickLinguoLine } from './linguoExpressions';

const useStyles = makeStyles({
  drawer: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1500,
    display: 'flex',
    justifyContent: 'center',
    animationName: 'ls-drawer-slide-up',
    animationDuration: tokens.durationSlower,
    animationTimingFunction: tokens.curveDecelerateMid,
  },
  inner: {
    width: '100%',
    maxWidth: '720px',
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('14px'),
    ...shorthands.borderRadius(tokens.borderRadiusXLarge, tokens.borderRadiusXLarge, 0, 0),
    boxShadow: tokens.shadow28,
    paddingTop: '18px',
    paddingLeft: 'max(18px, env(safe-area-inset-left))',
    paddingRight: 'max(18px, env(safe-area-inset-right))',
    paddingBottom: 'max(18px, env(safe-area-inset-bottom))',
    borderTopStyle: 'solid',
    borderTopWidth: '2px',
  },
  correct: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
    borderTopColor: tokens.colorPaletteGreenBorder2,
  },
  incorrect: {
    backgroundColor: tokens.colorPaletteRedBackground2,
    borderTopColor: tokens.colorPaletteRedBorder2,
  },
  avatarSlot: {
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('2px'),
  },
  headline: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('6px'),
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: tokens.fontSizeBase400,
  },
  headlineCorrect: {
    color: tokens.colorPaletteGreenForeground1,
  },
  headlineIncorrect: {
    color: tokens.colorPaletteRedForeground1,
  },
  solutionLine: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  tip: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground2,
  },
  continueButton: {
    minHeight: '48px',
    minWidth: '44px',
    flexShrink: 0,
    fontWeight: 700,
  },
});

interface LinguoFeedbackDrawerProps {
  correct: boolean;
  solution: string;
  explanation: string;
  streak: number;
  continueLabel: string;
  onContinue: () => void;
}

// The Duolingo-style reaction moment: slides up the instant an answer is
// graded, puts Linguo's face front and center, and carries the primary
// "Weiter" action so there's nowhere else to look. Purely a presentation
// layer over the existing solution/explanation/hint data — grading logic
// and content stay untouched in ExerciseRunner.
export const LinguoFeedbackDrawer = ({
  correct,
  solution,
  explanation,
  streak,
  continueLabel,
  onContinue,
}: LinguoFeedbackDrawerProps) => {
  const styles = useStyles();
  // Randomized once per graded answer, not on every re-render.
  const line = useMemo(() => pickLinguoLine(correct, streak), [correct, streak]);
  const expression = correct ? (streak >= 3 ? 'celebrating' : 'happy') : 'encouraging';

  return (
    <div className={styles.drawer} role="status" aria-live="polite">
      <div className={mergeClasses(styles.inner, correct ? styles.correct : styles.incorrect)}>
        <span className={styles.avatarSlot}>
          <LinguoAvatar expression={expression} size={64} animate="pop" />
        </span>
        <div className={styles.body}>
          <Text className={mergeClasses(styles.headline, correct ? styles.headlineCorrect : styles.headlineIncorrect)}>
            {correct ? <CheckmarkCircle24Filled /> : <HeartFilled />}
            {line}
          </Text>
          {!correct && (
            <Text className={styles.solutionLine}>
              Richtige Lösung: {solution}
            </Text>
          )}
          <Text className={styles.tip}>{explanation}</Text>
        </div>
        <Button className={styles.continueButton} appearance="primary" size="large" onClick={onContinue}>
          {continueLabel}
        </Button>
      </div>
    </div>
  );
};
