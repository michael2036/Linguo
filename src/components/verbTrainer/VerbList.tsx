import { useMemo, useState } from 'react';
import { Input, Text, makeStyles, mergeClasses, tokens, shorthands } from '@fluentui/react-components';
import { ChevronDown20Regular, ChevronRight20Regular, Search20Regular } from '@fluentui/react-icons';
import { principalParts, type Verb } from '../../lib/verbConjugation';
import { VerbChips } from './VerbChips';
import { VerbTable } from './VerbTable';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('10px'),
  },
  item: {
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('10px'),
    width: '100%',
    minHeight: '44px',
    ...shorthands.padding('10px', '12px'),
    ...shorthands.border('none'),
    backgroundColor: 'transparent',
    color: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('2px'),
    minWidth: 0,
  },
  term: {
    fontWeight: 700,
    fontSize: tokens.fontSizeBase400,
  },
  sub: {
    color: tokens.colorNeutralForeground3,
    fontSize: '13px',
    overflowWrap: 'anywhere',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('10px'),
    ...shorthands.padding('0', '12px', '12px'),
  },
  empty: {
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
    ...shorthands.padding('24px'),
  },
  expanded: {
    boxShadow: tokens.shadow4,
  },
});

interface VerbListProps {
  verbs: Verb[];
}

const normalize = (s: string): string => s.toLowerCase().normalize('NFC');

// Reference browser for the selected verbs: search by German or native
// term, expand any row for its full conjugation table.
export const VerbList = ({ verbs }: VerbListProps) => {
  const styles = useStyles();
  const [query, setQuery] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return verbs;
    return verbs.filter((v) => normalize(v.term).includes(q) || normalize(v.translation).includes(q));
  }, [verbs, query]);

  return (
    <div className={styles.wrap}>
      <Input
        contentBefore={<Search20Regular />}
        placeholder="Verb suchen (Deutsch oder Übersetzung)…"
        value={query}
        onChange={(_, data) => setQuery(data.value)}
        aria-label="Verb suchen"
      />
      {visible.length === 0 && <Text className={styles.empty}>Kein Verb gefunden.</Text>}
      {visible.map((verb) => {
        const open = openKey === verb.key;
        return (
          <div key={verb.key} className={mergeClasses(styles.item, open && styles.expanded)}>
            <button
              className={styles.header}
              aria-expanded={open}
              onClick={() => setOpenKey(open ? null : verb.key)}
            >
              {open ? <ChevronDown20Regular /> : <ChevronRight20Regular />}
              <span className={styles.headerText}>
                <Text className={styles.term}>{verb.term}</Text>
                <Text className={styles.sub}>
                  {verb.translation} · {principalParts(verb)}
                </Text>
              </span>
            </button>
            {open && (
              <div className={styles.body}>
                <VerbChips verb={verb} />
                <VerbTable verb={verb} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
