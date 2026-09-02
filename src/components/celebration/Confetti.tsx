import { useState } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  field: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 1000,
  },
  piece: {
    position: 'absolute',
    top: '-12px',
    borderRadius: '2px',
    animationName: 'ls-confetti-fall',
    animationTimingFunction: 'cubic-bezier(0.35, 0, 0.65, 1)',
    animationFillMode: 'forwards',
  },
});

const COLORS = [
  tokens.colorPaletteRedForeground1,
  tokens.colorPaletteGreenForeground1,
  tokens.colorPaletteMarigoldForeground1,
  tokens.colorBrandForeground1,
  tokens.colorPaletteBlueForeground2,
  tokens.colorPalettePinkForeground2,
];

interface Piece {
  left: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  drift: number;
}

// A tasteful one-shot confetti burst for the "chapter mastered" moment.
// Purely decorative and non-interactive (pointer-events: none), removed by
// the parent once its short animation window ends.
export const Confetti = ({ pieceCount = 60 }: { pieceCount?: number }) => {
  const styles = useStyles();

  // Lazy useState initializer (not useMemo) is the correct place for a
  // one-time non-deterministic value in React — it runs exactly once per
  // mount, not on every render.
  const [pieces] = useState<Piece[]>(() =>
    Array.from({ length: pieceCount }, () => ({
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.4,
      duration: 2.2 + Math.random() * 1.2,
      size: 6 + Math.random() * 6,
      drift: (Math.random() - 0.5) * 120,
    })),
  );

  return (
    <div className={styles.field} aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={styles.piece}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ['--ls-confetti-drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
};
