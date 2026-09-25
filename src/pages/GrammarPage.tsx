import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner, Text, ToggleButton, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { ArrowLeft24Regular, ArrowShuffle24Regular, CalendarStar24Regular, ChevronRight20Regular } from '@fluentui/react-icons';
import type { Level } from '../types/curriculum';
import type { GrammarCard } from '../types/grammar';
import { CATEGORY_LABEL, loadGrammarCards } from '../lib/grammarCards';
import { LEVEL_CATALOG, MODUL_CATALOG } from '../lib/curriculumLoader';
import { shuffle } from '../lib/vocabSrs';
import { GrammarCardView } from '../components/grammar/GrammarCardView';

type LevelFilter = 'all' | Level;

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('18px'),
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('6px'),
  },
  eyebrow: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
    maxWidth: '560px',
  },
  starters: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    ...shorthands.gap('12px'),
    '@media (min-width: 560px)': { gridTemplateColumns: '1fr 1fr' },
  },
  starter: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
    minHeight: '64px',
    ...shorthands.padding('14px', '16px'),
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
    color: 'inherit',
    fontFamily: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
    ':hover': { boxShadow: tokens.shadow8 },
  },
  starterIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    flexShrink: 0,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  starterText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  starterTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: tokens.fontSizeBase400,
  },
  starterBody: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
  },
  toggles: {
    display: 'flex',
    flexWrap: 'wrap',
    ...shorthands.gap('8px'),
  },
  levelToggle: {
    minWidth: '64px',
  },
  levelGroup: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  levelTitle: {
    fontWeight: 700,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: tokens.colorNeutralBackground1,
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.gap('10px'),
    minHeight: '52px',
    ...shorthands.padding('10px', '14px'),
    ...shorthands.border('none'),
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    backgroundColor: 'transparent',
    color: 'inherit',
    fontFamily: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
    ':last-child': { ...shorthands.borderBottom('none') },
    ':hover': { backgroundColor: tokens.colorNeutralBackground1Hover },
  },
  rowText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  rowTitle: {
    fontWeight: 600,
  },
  rowMeta: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  deckWrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
    marginTop: '-12px',
  },
  deckBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '480px',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  counter: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
  },
});

const LEVELS: Level[] = LEVEL_CATALOG.map((l) => l.level);

const lektionLabel = (lektionId: string): string | null => {
  for (const modul of MODUL_CATALOG) {
    const lektion = modul.lektionen.find((l) => l.lektionId === lektionId);
    if (lektion) return `Üben · ${modul.level} L${lektion.lektionNumber}`;
  }
  return null;
};

// Same card every day, different across days — stable enough to be "the
// card of the day" without persisting anything.
const dayIndex = (length: number): number => {
  const day = Math.floor(Date.now() / 86_400_000);
  return length ? day % length : 0;
};

// Grammatik: one-screen review cards, one topic each. Meant for the gaps
// between classes — a quick look before or after the course, not a lesson.
// Browse by level, open today's card, or shuffle a deck and swipe through.
export const GrammarPage = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [cards, setCards] = useState<GrammarCard[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [level, setLevel] = useState<LevelFilter>('all');
  const [deck, setDeck] = useState<GrammarCard[] | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    loadGrammarCards()
      .then(setCards)
      .catch(() => setLoadError(true));
  }, []);

  const filtered = useMemo(
    () => (cards ?? []).filter((c) => level === 'all' || c.level === level),
    [cards, level],
  );

  const openDeck = (nextDeck: GrammarCard[], start = 0) => {
    setDeck(nextDeck);
    setIndex(start);
    window.scrollTo(0, 0);
  };

  const next = useCallback(() => {
    if (deck) setIndex((i) => (i + 1) % deck.length);
  }, [deck]);
  const previous = useCallback(() => {
    if (deck) setIndex((i) => (i - 1 + deck.length) % deck.length);
  }, [deck]);

  if (loadError) {
    return (
      <div className={styles.wrap}>
        <Text className={styles.error}>Die Grammatikkarten konnten nicht geladen werden. Prüfe deine Verbindung und lade die Seite neu.</Text>
      </div>
    );
  }

  if (!cards) {
    return <Spinner label="Karten werden geladen…" />;
  }

  if (deck) {
    const card = deck[index];
    const practiceId = card.lektionIds[0];
    return (
      <div className={styles.deckWrap}>
        <div className={styles.deckBar}>
          <Button size="small" appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => setDeck(null)}>
            Alle Karten
          </Button>
          <Text className={styles.counter}>
            {index + 1} / {deck.length}
          </Text>
        </div>
        <GrammarCardView
          key={card.id}
          card={card}
          practiceLabel={practiceId ? lektionLabel(practiceId) : null}
          onPractice={() => navigate(`/lektion/${practiceId}`)}
          onNext={next}
          onPrevious={previous}
        />
      </div>
    );
  }

  const cardOfTheDay = filtered[dayIndex(filtered.length)];

  return (
    <div className={styles.wrap}>
      <div className={styles.titleBlock}>
        <Text className={styles.eyebrow}>Grammatik</Text>
        <Text className={styles.title} as="h1" size={700}>
          Grammatik auf einen Blick
        </Text>
        <Text className={styles.subtitle}>
          Ein Thema pro Karte, mit Beispielen und einem typischen Fehler — zum schnellen Wiederholen vor oder nach dem
          Kurs.
        </Text>
      </div>

      <div className={styles.toggles}>
        {(['all', ...LEVELS] as LevelFilter[]).map((l) => (
          <ToggleButton
            key={l}
            className={styles.levelToggle}
            checked={level === l}
            appearance={level === l ? 'primary' : 'secondary'}
            onClick={() => setLevel(l)}
          >
            {l === 'all' ? 'Alle' : l}
          </ToggleButton>
        ))}
      </div>

      {filtered.length > 0 && (
        <div className={styles.starters}>
          <button className={styles.starter} onClick={() => openDeck(filtered, filtered.indexOf(cardOfTheDay))}>
            <span className={styles.starterIcon}>
              <CalendarStar24Regular />
            </span>
            <span className={styles.starterText}>
              <Text className={styles.starterTitle}>Karte des Tages</Text>
              <Text className={styles.starterBody}>{cardOfTheDay.title}</Text>
            </span>
          </button>
          <button className={styles.starter} onClick={() => openDeck(shuffle(filtered))}>
            <span className={styles.starterIcon}>
              <ArrowShuffle24Regular />
            </span>
            <span className={styles.starterText}>
              <Text className={styles.starterTitle}>Mischen</Text>
              <Text className={styles.starterBody}>{filtered.length} Karten in zufälliger Reihenfolge</Text>
            </span>
          </button>
        </div>
      )}

      {LEVELS.filter((l) => level === 'all' || level === l).map((l) => {
        const levelCards = filtered.filter((c) => c.level === l);
        if (levelCards.length === 0) return null;
        return (
          <div key={l} className={styles.levelGroup}>
            <Text className={styles.levelTitle}>{LEVEL_CATALOG.find((info) => info.level === l)?.title}</Text>
            <div className={styles.list}>
              {levelCards.map((card) => (
                <button key={card.id} className={styles.row} onClick={() => openDeck(filtered, filtered.indexOf(card))}>
                  <span className={styles.rowText}>
                    <Text className={styles.rowTitle}>{card.title}</Text>
                    <Text className={styles.rowMeta}>{CATEGORY_LABEL[card.category]}</Text>
                  </span>
                  <ChevronRight20Regular />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
