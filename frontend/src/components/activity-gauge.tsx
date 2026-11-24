import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

// Tramos del medidor (mismos umbrales que la etiqueta que calcula el backend).
const SEGMENTS = [
  { from: 0, to: 25, color: '#728e6d' }, // Tranquila
  { from: 25, to: 50, color: '#7bd389' }, // Activa
  { from: 50, to: 80, color: '#e5cd82' }, // Muy activa
  { from: 80, to: 100, color: '#e05263' }, // ¡En llamas!
];

const CX = 50;
const CY = 52;
const RADIUS = 40;
const NEEDLE = 33;

// 0 % = extremo izquierdo (180°), 100 % = extremo derecho (0°).
const angleFor = (percent: number) => ((180 - percent * 1.8) * Math.PI) / 180;
const pointAt = (percent: number, radius: number) => {
  const angle = angleFor(percent);
  return { x: CX + radius * Math.cos(angle), y: CY - radius * Math.sin(angle) };
};

function arcPath(from: number, to: number) {
  const start = pointAt(from + 0.8, RADIUS);
  const end = pointAt(to - 0.8, RADIUS);
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${RADIUS} ${RADIUS} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

const colorFor = (score: number) => (SEGMENTS.find((s) => score < s.to) ?? SEGMENTS[SEGMENTS.length - 1]).color;

type Props = { score: number | null; label: string };

export function ActivityGauge({ score, label }: Props) {
  const target = score ?? 0;
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);

  // La aguja se desliza hasta el valor nuevo en 0,7 s.
  useEffect(() => {
    const from = shownRef.current;
    const start = Date.now();
    const interval = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / 700);
      const value = from + (target - from) * (1 - Math.pow(1 - t, 3));
      shownRef.current = value;
      setShown(value);
      if (t >= 1) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [target]);

  const tip = pointAt(shown, NEEDLE);

  return (
    <View style={styles.box}>
      <Text style={styles.title}>ACTIVIDAD</Text>
      <Svg width={104} height={62} viewBox="0 0 100 60">
        {SEGMENTS.map((s) => (
          <Path
            key={s.from}
            d={arcPath(s.from, s.to)}
            stroke={s.color}
            strokeWidth={9}
            strokeLinecap="butt"
            fill="none"
          />
        ))}
        <Line x1={CX} y1={CY} x2={tip.x} y2={tip.y} stroke="#fff8dc" strokeWidth={3} strokeLinecap="round" />
        <Circle cx={CX} cy={CY} r={5} fill="#fff8dc" />
      </Svg>
      <Text style={styles.value}>{score === null ? '–' : `${Math.round(score)}%`}</Text>
      <Text style={[styles.label, score !== null && { color: colorFor(score) }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 120,
    height: 150,
    backgroundColor: '#15370d',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 2,
  },
  title: { color: '#b9c9b2', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  value: { color: '#fff8dc', fontSize: 24, fontWeight: '900' },
  label: { color: '#fff8dc', fontSize: 13, fontWeight: '700', textAlign: 'center' },
});