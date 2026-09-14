import { StyleSheet, Text, TextStyle, View } from 'react-native';

type Props = {
  text: string;
  style: TextStyle;
  color: string;
  outlineColor?: string;
  outlineWidth?: number;
};

const DIRECCIONES: [number, number][] = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
];

/**
 * React Native no tiene un equivalente a `-webkit-text-stroke`, así que
 * simulamos el borde apilando copias del texto en el color de contorno
 * desplazadas 1px en cada dirección, con el texto real encima.
 */
export function OutlinedText({ text, style, color, outlineColor = '#000000', outlineWidth = 1 }: Props) {
  return (
    <View style={styles.wrapper}>
      {DIRECCIONES.map(([dx, dy]) => (
        <Text
          key={`${dx}-${dy}`}
          style={[style, styles.capa, { color: outlineColor, left: dx * outlineWidth, top: dy * outlineWidth }]}>
          {text}
        </Text>
      ))}
      <Text style={[style, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  capa: {
    position: 'absolute',
  },
});
