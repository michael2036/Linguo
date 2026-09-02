import { makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  ring: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.borderRadiusCircular,
    animationName: 'ls-pop',
    animationDuration: tokens.durationSlower,
    animationTimingFunction: tokens.curveDecelerateMid,
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralBackground1,
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
  },
});

interface ScoreRingProps {
  percent: number;
  size?: number;
  color?: string;
}

export const ScoreRing = ({ percent, size = 120, color }: ScoreRingProps) => {
  const styles = useStyles();
  const ringColor = color ?? (percent >= 80 ? tokens.colorPaletteGreenForeground1 : percent >= 60 ? tokens.colorPaletteMarigoldForeground1 : tokens.colorPaletteRedForeground1);
  const trackColor = tokens.colorNeutralStroke2;
  const thickness = Math.round(size * 0.09);

  return (
    <div
      className={styles.ring}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${ringColor} ${Math.round(percent * 3.6)}deg, ${trackColor} 0deg)`,
        padding: thickness,
      }}
    >
      <div className={styles.inner} style={{ width: size - thickness * 2, height: size - thickness * 2, fontSize: size * 0.22 }}>
        {percent}%
      </div>
    </div>
  );
};
