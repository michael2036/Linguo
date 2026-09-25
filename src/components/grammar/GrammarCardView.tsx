import { useEffect, useRef, useState } from 'react';
import { Button, Text, makeStyles, mergeClasses, tokens, shorthands } from '@fluentui/react-components';
import {
  ArrowRight24Regular,
  ArrowUndo20Regular,
  ArrowRotateClockwise20Regular,
  BookOpen20Regular,
  Warning20Filled,
} from '@fluentui/react-icons';
import type { GrammarCard, GrammarColumn, HighlightTone } from '../../types/grammar';
import { CATEGORY_LABEL } from '../../lib/grammarCards';
import { Marked } from './Marked';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('14px'),
    width: '100%',
    maxWidth: '480px',
    marginLeft: 'auto',
    marginRight: 'auto',
    // One phone screen: viewport minus header, page padding and bottom nav.
    minHeight: 'calc(100dvh - 215px)',
    ...shorthands.padding('16px', '18px', '14px'),
    ...shorthands.borderRadius('24px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow8,
    touchAction: 'pan-y',
    '@media (min-width: 768px)': {
      minHeight: '680px',
    },
  },
  enter: {
    animationName: 'ls-slide-in',
    animationDuration: '220ms',
    animationTimingFunction: tokens.curveDecelerateMid,
    '@media (prefers-reduced-motion: reduce)': { animationName: 'none' },
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    ...shorthands.gap('6px'),
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    ...shorthands.gap('8px'),
  },
  chip: {
    fontSize: '12px',
    fontWeight: 600,
    ...shorthands.padding('3px', '10px'),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '26px',
    lineHeight: '1.2',
    fontWeight: 700,
    textWrap: 'balance',
  },
  subtitle: {
    fontSize: '16px',
    lineHeight: '1.5',
    color: tokens.colorNeutralForeground2,
  },
  columns: {
    display: 'flex',
    ...shorthands.gap('10px'),
  },
  columnsStacked: {
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  columnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    ...shorthands.gap('10px'),
    ...shorthands.padding('10px', '12px'),
  },
  columnHead: {
    display: 'flex',
    flexDirection: 'column',
    width: '92px',
    flexShrink: 0,
  },
  column: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
    ...shorthands.padding('12px', '14px', '14px'),
    ...shorthands.borderRadius('16px'),
  },
  colAccent: { backgroundColor: tokens.colorBrandBackground2, color: tokens.colorBrandForeground1 },
  colSuccess: { backgroundColor: tokens.colorPaletteGreenBackground1, color: tokens.colorPaletteGreenForeground1 },
  colNeutral: { backgroundColor: tokens.colorNeutralBackground3, color: tokens.colorNeutralForeground1 },
  colLabel: { fontSize: '13px', fontWeight: 700 },
  colSublabel: { fontSize: '12px', opacity: 0.85, marginBottom: '4px' },
  colWords: { fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, lineHeight: '1.45' },
  colLines: { fontSize: '15px', lineHeight: '1.5', color: tokens.colorNeutralForeground1 },
  chipRow: { display: 'flex', flexWrap: 'wrap', ...shorthands.gap('6px'), marginTop: '2px' },
  wordChip: {
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    fontWeight: 600,
    ...shorthands.padding('3px', '10px'),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    backgroundColor: tokens.colorNeutralBackground1,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '15px',
  },
  th: {
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    ...shorthands.padding('0', '8px', '6px'),
  },
  td: {
    ...shorthands.padding('8px'),
    ...shorthands.borderTop('1px', 'solid', tokens.colorNeutralStroke2),
    verticalAlign: 'top',
  },
  tdHighlight: {
    fontWeight: 700,
    color: tokens.colorBrandForeground1,
    backgroundColor: tokens.colorBrandBackground2,
  },
  tip: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
  },
  examples: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
  },
  example: {
    fontSize: '17px',
    lineHeight: '1.5',
  },
  result: {
    display: 'block',
    fontSize: '16px',
    color: tokens.colorNeutralForeground2,
  },
  warning: {
    display: 'flex',
    ...shorthands.gap('10px'),
    ...shorthands.padding('12px', '14px'),
    ...shorthands.borderRadius('14px'),
    backgroundColor: tokens.colorPaletteMarigoldBackground1,
    color: tokens.colorNeutralForeground1,
    fontSize: '15px',
    lineHeight: '1.45',
  },
  warningIcon: {
    color: tokens.colorPaletteMarigoldForeground2,
    flexShrink: 0,
    marginTop: '2px',
  },
  wrong: {
    textDecorationLine: 'line-through',
    color: tokens.colorNeutralForeground3,
  },
  right: {
    fontWeight: 600,
  },
  footer: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('10px'),
  },
  actions: {
    display: 'flex',
    ...shorthands.gap('10px'),
    '& > *': { flex: 1, minHeight: '44px' },
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  sectionLine: {
    fontSize: '16px',
    lineHeight: '1.55',
  },
  checkItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    ...shorthands.gap('2px'),
    ...shorthands.padding('8px', '12px'),
    ...shorthands.borderRadius('12px'),
    ...shorthands.border('none'),
    backgroundColor: tokens.colorNeutralBackground3,
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: '15px',
    textAlign: 'left',
    cursor: 'pointer',
  },
  revealHint: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
  },
  answer: {
    fontWeight: 700,
    color: tokens.colorBrandForeground1,
  },
});

const TONE_CLASS: Record<HighlightTone, 'colAccent' | 'colSuccess' | 'colNeutral'> = {
  accent: 'colAccent',
  success: 'colSuccess',
  neutral: 'colNeutral',
};

const Column = ({ column, row }: { column: GrammarColumn; row: boolean }) => {
  const styles = useStyles();
  const head = (
    <>
      <Text className={styles.colLabel}>{column.label}</Text>
      {column.sublabel && <Text className={styles.colSublabel}>{column.sublabel}</Text>}
    </>
  );
  return (
    <div className={mergeClasses(styles.column, styles[TONE_CLASS[column.tone]], row && styles.columnRow)}>
      {row ? <div className={styles.columnHead}>{head}</div> : head}
      {column.inline ? (
        <div className={styles.chipRow}>
          {column.items.map((item) => (
            <span key={item} className={styles.wordChip}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        column.items.map((item, i) => (
          <Text key={i} className={column.lines ? styles.colLines : styles.colWords}>
            <Marked text={item} />
          </Text>
        ))
      )}
    </div>
  );
};

interface GrammarCardViewProps {
  card: GrammarCard;
  practiceLabel: string | null;
  onPractice: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const SWIPE_THRESHOLD = 60;

// One grammar topic on one phone screen. The front is the glanceable
// summary; tapping it turns the card over to the forms and a 3-item
// self-check. Swipe left/right (or ←/→) moves through the deck.
export const GrammarCardView = ({ card, practiceLabel, onPractice, onNext, onPrevious }: GrammarCardViewProps) => {
  const styles = useStyles();
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNext();
      else if (e.key === 'ArrowLeft') onPrevious();
      else if (e.key === ' ' && (e.target as HTMLElement).tagName !== 'BUTTON') {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onNext, onPrevious]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) onNext();
    else onPrevious();
  };

  const footer = (
    <div className={styles.footer}>
      <div className={styles.actions}>
        {practiceLabel && (
          <Button appearance="secondary" icon={<BookOpen20Regular />} onClick={onPractice}>
            {practiceLabel}
          </Button>
        )}
        <Button appearance="primary" icon={<ArrowRight24Regular />} iconPosition="after" onClick={onNext}>
          Nächste Karte
        </Button>
      </div>
    </div>
  );

  const header = (
    <div className={styles.header}>
      <div className={styles.topRow}>
        <span className={styles.chip}>
          {card.level} · {CATEGORY_LABEL[card.category]}
        </span>
        <Button
          size="small"
          appearance="subtle"
          icon={flipped ? <ArrowUndo20Regular /> : <ArrowRotateClockwise20Regular />}
          onClick={() => setFlipped((f) => !f)}
        >
          {flipped ? 'Vorderseite' : 'Formen und Check'}
        </Button>
      </div>
      <Text as="h1" className={styles.title}>
        {card.title}
      </Text>
      {!flipped && <Text className={styles.subtitle}>{card.subtitle}</Text>}
    </div>
  );

  return (
    <article
      key={`${card.id}-${flipped ? 'back' : 'front'}`}
      className={mergeClasses(styles.card, styles.enter)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label={`Grammatikkarte: ${card.title}${flipped ? ', Rückseite' : ''}`}
    >
      {header}

      {!flipped ? (
        <>
          {card.visual.kind === 'columns' ? (
            <div
              className={mergeClasses(
                styles.columns,
                // Chip lists need the full width to flow; side by side
                // each word would wrap onto its own row.
                card.visual.columns.every((c) => c.inline) && styles.columnsStacked,
              )}
            >
              {card.visual.columns.map((column) => (
                <Column
                  key={column.label}
                  column={column}
                  row={card.visual.kind === 'columns' && card.visual.columns.length > 1 && card.visual.columns.every((c) => c.inline)}
                />
              ))}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  {card.visual.headers.map((h) => (
                    <th key={h} className={styles.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {card.visual.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={mergeClasses(
                          styles.td,
                          card.visual.kind === 'table' && card.visual.highlightColumn === c && styles.tdHighlight,
                        )}
                      >
                        <Marked text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {card.tip && (
            <Text className={styles.tip}>
              <Marked text={card.tip} />
            </Text>
          )}

          <div className={styles.examples}>
            {card.examples.map((ex, i) => (
              <Text key={i} className={styles.example}>
                <Marked text={ex.text} />
                {ex.result && (
                  <span className={styles.result}>
                    → <Marked text={ex.result} />
                  </span>
                )}
              </Text>
            ))}
          </div>

          <div className={styles.warning} role="note">
            <Warning20Filled className={styles.warningIcon} aria-hidden />
            <span>
              <span className={styles.wrong}>{card.warning.wrong}</span>
              <br />
              <span className={styles.right}>{card.warning.right}</span>
              <br />
              {card.warning.note}
            </span>
          </div>
        </>
      ) : (
        <>
          {card.back.sections.map((section) => (
            <div key={section.title} className={styles.section}>
              <Text className={styles.sectionTitle}>{section.title}</Text>
              {section.lines.map((line, i) => (
                <Text key={i} className={styles.sectionLine}>
                  <Marked text={line} />
                </Text>
              ))}
            </div>
          ))}

          <div className={styles.section}>
            <Text className={styles.sectionTitle}>Mini-Check</Text>
            {card.back.check.map((item, i) => (
              <button
                key={i}
                className={styles.checkItem}
                onClick={() => setRevealed((prev) => new Set(prev).add(i))}
                aria-label={revealed.has(i) ? undefined : `${item.prompt} — Lösung zeigen`}
              >
                <Text>{item.prompt}</Text>
                <Text className={revealed.has(i) ? styles.answer : styles.revealHint}>
                  {revealed.has(i) ? item.answer : 'Tippen für die Lösung'}
                </Text>
              </button>
            ))}
          </div>
        </>
      )}

      {footer}
    </article>
  );
};
