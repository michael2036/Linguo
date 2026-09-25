import { Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { PERSONS, PERSON_LABEL, TENSE_LABEL, conjugate, type Tense, type Verb } from '../../lib/verbConjugation';

const TENSES: Tense[] = ['praesens', 'praeteritum', 'perfekt'];

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    ...shorthands.gap('10px'),
    width: '100%',
    '@media (min-width: 640px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },
  block: {
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.padding('10px', '12px'),
    backgroundColor: tokens.colorNeutralBackground1,
    textAlign: 'left',
  },
  tenseTitle: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: tokens.colorBrandForeground1,
    marginBottom: '6px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '72px 1fr',
    columnGap: '8px',
    paddingTop: '2px',
    paddingBottom: '2px',
  },
  person: {
    color: tokens.colorNeutralForeground3,
    fontSize: '13px',
  },
  form: {
    fontWeight: 600,
    fontSize: '14px',
    overflowWrap: 'anywhere',
  },
});

interface VerbTableProps {
  verb: Verb;
}

// All six persons in the three drilled tenses. Shows every person even for
// 3rd-person-only verbs — this is a reference view, not a drill — so the
// paradigm reads the same shape for every verb.
export const VerbTable = ({ verb }: VerbTableProps) => {
  const styles = useStyles();
  return (
    <div className={styles.grid}>
      {TENSES.map((tense) => {
        const forms = conjugate(verb, tense);
        return (
          <div key={tense} className={styles.block}>
            <Text className={styles.tenseTitle}>{TENSE_LABEL[tense]}</Text>
            {PERSONS.map((person, i) => (
              <div key={person} className={styles.row}>
                <Text className={styles.person}>{PERSON_LABEL[person]}</Text>
                <Text className={styles.form}>{forms[i]}</Text>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};
