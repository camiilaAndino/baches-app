import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { StarRating } from '@/components/star-rating';
import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TimelineSteps } from '@/components/timeline-steps';
import { Denuncia, TIPO_META } from '@/constants/denuncias';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function DenunciaCard({ denuncia }: { denuncia: Denuncia }) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [calificacion, setCalificacion] = useState(denuncia.calificacion ?? 0);
  const tipoMeta = TIPO_META[denuncia.tipo];

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Pressable
        onPress={() => setIsOpen((value) => !value)}
        style={({ pressed }) => pressed && styles.pressed}>
        <View style={styles.headerRow}>
          <View style={[styles.typeIcon, { backgroundColor: `${tipoMeta.color}26` }]}>
            <SymbolView name={tipoMeta.icon} size={18} tintColor={tipoMeta.color} />
          </View>

          <View style={styles.headerTexts}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {denuncia.titulo}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {denuncia.direccion} · {denuncia.fecha}
            </ThemedText>
          </View>

          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={13}
            weight="bold"
            tintColor={theme.textSecondary}
            style={{ transform: [{ rotate: isOpen ? '-90deg' : '90deg' }] }}
          />
        </View>

        <View style={styles.metaRow}>
          <StatusBadge estado={denuncia.estado} />

          {denuncia.anonima && (
            <View style={styles.metaTag}>
              <SymbolView
                name={{ ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }}
                size={11}
                tintColor={theme.textSecondary}
              />
              <ThemedText type="small" themeColor="textSecondary">
                Anónima
              </ThemedText>
            </View>
          )}

          <View style={styles.metaTag}>
            <SymbolView
              name={{ ios: 'photo', android: 'image', web: 'image' }}
              size={11}
              tintColor={theme.textSecondary}
            />
            <ThemedText type="small" themeColor="textSecondary">
              {denuncia.fotos}
            </ThemedText>
          </View>

          {denuncia.comentarios.length > 0 && (
            <View style={styles.metaTag}>
              <SymbolView
                name={{ ios: 'bubble.left', android: 'chat_bubble', web: 'chat_bubble' }}
                size={11}
                tintColor={theme.textSecondary}
              />
              <ThemedText type="small" themeColor="textSecondary">
                {denuncia.comentarios.length}
              </ThemedText>
            </View>
          )}
        </View>
      </Pressable>

      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.details}>
          <ThemedText type="small">{denuncia.descripcion}</ThemedText>

          <View style={styles.thumbRow}>
            {Array.from({ length: denuncia.fotos }).map((_, index) => (
              <ThemedView key={index} type="backgroundSelected" style={styles.thumb}>
                <SymbolView
                  name={{ ios: 'photo', android: 'image', web: 'image' }}
                  size={16}
                  tintColor={theme.textSecondary}
                />
              </ThemedView>
            ))}
          </View>

          <View style={styles.divider} />

          <ThemedText type="small" themeColor="textSecondary">
            Seguimiento
          </ThemedText>
          <TimelineSteps estado={denuncia.estado} />

          <View style={styles.divider} />

          <ThemedText type="small" themeColor="textSecondary">
            Comentarios
          </ThemedText>

          {denuncia.comentarios.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              Todavía no hay comentarios.
            </ThemedText>
          ) : (
            <View style={styles.comments}>
              {denuncia.comentarios.map((comentario) => (
                <ThemedView key={comentario.id} type="backgroundSelected" style={styles.comment}>
                  <View style={styles.commentHeader}>
                    <ThemedText type="small" style={styles.commentAuthor}>
                      {comentario.autor}
                    </ThemedText>
                    {comentario.esOficial && (
                      <View style={[styles.officialTag, { backgroundColor: `${theme.primary}26` }]}>
                        <ThemedText type="small" style={[styles.officialTagText, { color: theme.primary }]}>
                          Oficial
                        </ThemedText>
                      </View>
                    )}
                    <ThemedText type="small" themeColor="textSecondary">
                      {comentario.fecha}
                    </ThemedText>
                  </View>
                  <ThemedText type="small">{comentario.mensaje}</ThemedText>
                </ThemedView>
              ))}
            </View>
          )}

          <View style={styles.replyRow}>
            <ThemedView type="backgroundSelected" style={styles.replyInputWrapper}>
              <TextInput
                placeholder="Responder o pedir novedades..."
                placeholderTextColor={theme.textSecondary}
                style={[styles.replyInput, { color: theme.text }]}
              />
            </ThemedView>
            <Pressable style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}>
              <ThemedView type="backgroundSelected" style={styles.sendButtonCircle}>
                <SymbolView
                  name={{ ios: 'paperplane.fill', android: 'send', web: 'send' }}
                  size={14}
                  tintColor={theme.text}
                />
              </ThemedView>
            </Pressable>
          </View>

          {denuncia.estado === 'resuelta' && (
            <>
              <View style={styles.divider} />
              <View style={styles.ratingRow}>
                <ThemedText type="small" themeColor="textSecondary">
                  Calificá la resolución
                </ThemedText>
                <StarRating value={calificacion} onChange={setCalificacion} />
              </View>
            </>
          )}
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  details: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#80808040',
    marginVertical: Spacing.one,
  },
  comments: {
    gap: Spacing.two,
  },
  comment: {
    borderRadius: Spacing.two,
    padding: Spacing.two,
    gap: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  commentAuthor: {
    fontWeight: '700',
  },
  officialTag: {
    borderRadius: 999,
    paddingHorizontal: Spacing.one,
    paddingVertical: 1,
  },
  officialTagText: {
    fontSize: 10,
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  replyInputWrapper: {
    flex: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  replyInput: {
    fontSize: 13,
    padding: 0,
  },
  sendButton: {},
  sendButtonCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
