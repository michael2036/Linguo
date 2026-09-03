import { makeStyles, mergeClasses, tokens, shorthands } from '@fluentui/react-components';
import { CheckmarkCircle16Filled } from '@fluentui/react-icons';
import type { Level } from '../../types/curriculum';

const useStyles = makeStyles({
  tabs: {
    display: 'flex',
    ...shorthands.gap('8px'),
    overflowX: 'auto',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('6px'),
    minHeight: '44px',
    flexShrink: 0,
    ...shorthands.padding('0', '18px'),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground2,
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    cursor: 'pointer',
    transitionProperty: 'background-color, border-color, color',
    transitionDuration: tokens.durationFaster,
  },
  tabActive: {
    ...shorthands.borderColor(tokens.colorBrandStroke1),
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  mastered: {
    color: tokens.colorPaletteGreenForeground1,
    flexShrink: 0,
  },
  masteredActive: {
    color: tokens.colorNeutralForegroundOnBrand,
  },
});

interface LevelTabsProps {
  levels: { level: Level; title: string }[];
  activeLevel: Level;
  masteredLevels: Level[];
  onSelect: (level: Level) => void;
}

// A high-level selector so the dashboard reveals one level's content at a
// time instead of every Lektion of every level at once (FR: progressive
// navigation). Plain, scrollable button row — no external tab library
// needed for three items.
export const LevelTabs = ({ levels, activeLevel, masteredLevels, onSelect }: LevelTabsProps) => {
  const styles = useStyles();
  return (
    <div className={styles.tabs} role="tablist" aria-label="Sprachniveau">
      {levels.map(({ level }) => {
        const isActive = level === activeLevel;
        const isMastered = masteredLevels.includes(level);
        return (
          <button
            key={level}
            role="tab"
            aria-selected={isActive}
            className={mergeClasses(styles.tab, isActive && styles.tabActive)}
            onClick={() => onSelect(level)}
          >
            {level}
            {isMastered && (
              <CheckmarkCircle16Filled className={mergeClasses(styles.mastered, isActive && styles.masteredActive)} />
            )}
          </button>
        );
      })}
    </div>
  );
};
