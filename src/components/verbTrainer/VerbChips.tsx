import { makeStyles, mergeClasses, tokens, shorthands } from '@fluentui/react-components';
import { CATEGORY_LABEL, type Verb } from '../../lib/verbConjugation';

const useStyles = makeStyles({
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'inherit',
    ...shorthands.gap('6px'),
  },
  chip: {
    fontSize: '11px',
    fontWeight: 600,
    ...shorthands.padding('2px', '8px'),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground2,
  },
  irregular: {
    backgroundColor: tokens.colorPaletteMarigoldBackground2,
    color: tokens.colorPaletteMarigoldForeground2,
  },
  accent: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
});

interface VerbChipsProps {
  verb: Verb;
}

export const VerbChips = ({ verb }: VerbChipsProps) => {
  const styles = useStyles();
  return (
    <div className={styles.row}>
      {verb.categories.map((category) => (
        <span
          key={category}
          className={mergeClasses(
            styles.chip,
            category === 'irregular' && styles.irregular,
            category !== 'regular' && category !== 'irregular' && styles.accent,
          )}
        >
          {CATEGORY_LABEL[category]}
        </span>
      ))}
      <span className={styles.chip}>Perfekt mit „{verb.auxiliary}“</span>
      {verb.prepositions.length > 0 && (
        <span className={styles.chip}>+ {verb.prepositions.join(' / ')}</span>
      )}
    </div>
  );
};
