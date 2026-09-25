import { ProgressBar, Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import type { VocabWordProgress } from '../../types/appState';
import type { Verb } from '../../lib/verbConjugation';
import { SKILL_LABEL, VERB_SKILLS, skillKey } from '../../lib/verbQuiz';
import { isMastered } from '../../lib/vocabSrs';

const useStyles = makeStyles({
  wrap: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    ...shorthands.gap('10px'),
    ...shorthands.padding('14px', '16px'),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: tokens.colorNeutralBackground3,
    '@media (min-width: 560px)': {
      gridTemplateColumns: '1fr 1fr',
      columnGap: '24px',
    },
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  label: {
    fontWeight: 600,
  },
  count: {
    color: tokens.colorNeutralForeground3,
  },
});

interface VerbSkillProgressProps {
  verbs: Verb[];
  progress: Record<string, VocabWordProgress>;
}

// How many of the current verbs are mastered in each skill — the "map" of
// what's solid and what still needs work, independent of the focus chosen
// for the next round.
export const VerbSkillProgress = ({ verbs, progress }: VerbSkillProgressProps) => {
  const styles = useStyles();
  const total = verbs.length;
  return (
    <div className={styles.wrap}>
      {VERB_SKILLS.map((skill) => {
        const mastered = verbs.filter((v) => isMastered(progress[skillKey(v, skill)])).length;
        return (
          <div key={skill} className={styles.row}>
            <div className={styles.labelRow}>
              <Text className={styles.label}>{SKILL_LABEL[skill]}</Text>
              <Text className={styles.count}>
                {mastered}/{total} gemeistert
              </Text>
            </div>
            <ProgressBar value={total ? mastered / total : 0} thickness="large" />
          </div>
        );
      })}
    </div>
  );
};
