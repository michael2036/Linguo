import { useState } from 'react';
import { Checkbox, Text, makeStyles, mergeClasses, tokens, shorthands } from '@fluentui/react-components';
import { ChevronDown20Regular, ChevronRight20Regular } from '@fluentui/react-icons';
import { LEVEL_CATALOG, MODUL_CATALOG } from '../../lib/curriculumLoader';

type NodeState = 'checked' | 'unchecked' | 'mixed';

const deriveState = (ids: string[], selected: Set<string>): NodeState => {
  const count = ids.filter((id) => selected.has(id)).length;
  if (count === 0) return 'unchecked';
  if (count === ids.length) return 'checked';
  return 'mixed';
};

const checkedProp = (state: NodeState): boolean | 'mixed' =>
  state === 'checked' ? true : state === 'mixed' ? 'mixed' : false;

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('10px'),
  },
  levelBlock: {
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.padding('6px', '10px'),
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('6px'),
    minHeight: '44px',
  },
  levelRow: {
    fontWeight: 700,
  },
  modulRow: {
    marginLeft: '4px',
  },
  lektionRow: {
    marginLeft: '52px',
  },
  expandButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    flexShrink: 0,
    color: tokens.colorNeutralForeground3,
    cursor: 'pointer',
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  expandSpacer: {
    width: '28px',
    flexShrink: 0,
  },
  modulTitle: {
    fontWeight: 600,
  },
  countBadge: {
    marginLeft: 'auto',
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    flexShrink: 0,
  },
});

interface CurriculumSelectTreeProps {
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}

// Tri-state Level -> Modul -> Lektion checkbox tree: checking a Level or
// Modul checks/unchecks every Lektion underneath it, and shows "mixed" when
// only some of its children are selected. The Lektion is the only real
// selection unit — Level/Modul state is always derived from it.
export const CurriculumSelectTree = ({ selected, onChange }: CurriculumSelectTreeProps) => {
  const styles = useStyles();
  const [expandedModuln, setExpandedModuln] = useState<Set<string>>(new Set());

  const toggleExpand = (modulId: string) => {
    setExpandedModuln((prev) => {
      const next = new Set(prev);
      if (next.has(modulId)) next.delete(modulId);
      else next.add(modulId);
      return next;
    });
  };

  const setIds = (ids: string[], checked: boolean) => {
    const next = new Set(selected);
    ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
    onChange(next);
  };

  const levels = LEVEL_CATALOG.filter((l) => MODUL_CATALOG.some((m) => m.level === l.level));

  return (
    <div className={styles.wrap}>
      {levels.map(({ level, title }) => {
        const moduln = MODUL_CATALOG.filter((m) => m.level === level);
        const levelIds = moduln.flatMap((m) => m.lektionen.map((l) => l.lektionId));
        const levelState = deriveState(levelIds, selected);

        return (
          <div key={level} className={styles.levelBlock}>
            <div className={mergeClasses(styles.row, styles.levelRow)}>
              <span className={styles.expandSpacer} />
              <Checkbox
                checked={checkedProp(levelState)}
                onChange={() => setIds(levelIds, levelState !== 'checked')}
                label={title}
              />
              <Text className={styles.countBadge}>
                {levelIds.filter((id) => selected.has(id)).length}/{levelIds.length}
              </Text>
            </div>

            {moduln.map((modul) => {
              const modulIds = modul.lektionen.map((l) => l.lektionId);
              const modulState = deriveState(modulIds, selected);
              const expanded = expandedModuln.has(modul.modulId);

              return (
                <div key={modul.modulId}>
                  <div className={mergeClasses(styles.row, styles.modulRow)}>
                    <span
                      className={styles.expandButton}
                      onClick={() => toggleExpand(modul.modulId)}
                      role="button"
                      tabIndex={0}
                      aria-label={expanded ? 'Lektionen einklappen' : 'Lektionen ausklappen'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleExpand(modul.modulId);
                        }
                      }}
                    >
                      {expanded ? <ChevronDown20Regular /> : <ChevronRight20Regular />}
                    </span>
                    <Checkbox
                      checked={checkedProp(modulState)}
                      onChange={() => setIds(modulIds, modulState !== 'checked')}
                      label={
                        <span className={styles.modulTitle}>{`Modul ${modul.modulNumber} · ${modul.title}`}</span>
                      }
                    />
                    <Text className={styles.countBadge}>
                      {modulIds.filter((id) => selected.has(id)).length}/{modulIds.length}
                    </Text>
                  </div>

                  {expanded &&
                    modul.lektionen.map((lektion) => (
                      <div key={lektion.lektionId} className={mergeClasses(styles.row, styles.lektionRow)}>
                        <Checkbox
                          checked={selected.has(lektion.lektionId)}
                          onChange={() => setIds([lektion.lektionId], !selected.has(lektion.lektionId))}
                          label={`Lektion ${lektion.lektionNumber}: ${lektion.title}`}
                        />
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
