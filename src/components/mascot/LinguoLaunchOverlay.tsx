import { useEffect, useState } from 'react';
import { Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { LinguoAvatar } from './LinguoAvatar';
import type { LinguoExpression } from './linguoExpressions';

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    textAlign: 'center',
    paddingLeft: '24px',
    paddingRight: '24px',
    backgroundImage: `linear-gradient(160deg, ${tokens.colorBrandBackground}, ${tokens.colorBrandBackground2})`,
    transitionProperty: 'opacity, visibility',
    transitionDuration: '380ms',
    transitionTimingFunction: 'ease',
  },
  hiding: {
    opacity: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    fontWeight: 700,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    maxWidth: '280px',
  },
});

interface LinguoLaunchOverlayProps {
  title: string;
  subtitle?: string;
  expression: LinguoExpression;
  onDone: () => void;
  holdMs?: number;
}

// A brief, full-screen "presenting the activity" beat before vocab, a
// practice tier, or Test actually mounts — the same hold-then-fade
// mechanic as the cold-start splash (index.html/main.tsx), just triggered
// by in-app navigation instead of page load, and built with Fluent tokens
// since it renders after React has mounted (the cold-start splash can't
// use those — it paints before any JS runs).
export const LinguoLaunchOverlay = ({ title, subtitle, expression, onDone, holdMs = 1100 }: LinguoLaunchOverlayProps) => {
  const styles = useStyles();
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const holdTimer = window.setTimeout(() => setHiding(true), holdMs);
    return () => window.clearTimeout(holdTimer);
  }, [holdMs]);

  useEffect(() => {
    if (!hiding) return;
    const removeTimer = window.setTimeout(onDone, 420);
    return () => window.clearTimeout(removeTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiding]);

  return (
    <div className={mergeClasses(styles.overlay, hiding && styles.hiding)} role="status" aria-live="polite">
      <LinguoAvatar expression={expression} size={96} animate="pop" />
      <Text className={styles.title}>{title}</Text>
      {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
    </div>
  );
};
