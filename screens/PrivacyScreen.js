import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '../i18n';
import { useTheme } from '../src/theme';

export default function PrivacyScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const tools = [
    { key: 'shortener', type: 'server' },
    { key: 'pastebin', type: 'server' },
    { key: 'share', type: 'server' },
    { key: 'qr', type: 'server' },
    { key: 'password', type: 'local' },
    { key: 'jsonFormatter', type: 'local' },
    { key: 'base64', type: 'local' },
    { key: 'jwt', type: 'local' },
    { key: 'uuid', type: 'local' },
    { key: 'exportView', type: 'local' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{t('privacy.title')}</Text>
        <Text style={styles.heroText}>{t('privacy.intro')}</Text>
      </View>

      {tools.map((tool) => {
        const base = `privacy.tools.${tool.key}`;
        return (
          <View key={tool.key} style={styles.card}>
            <Text style={styles.cardTitle}>{t(`${base}.title`)}</Text>
            <View style={[styles.tag, tool.type === 'local' ? styles.localTag : styles.serverTag]}>
              <Text style={styles.tagText}>{tool.type === 'local' ? t('privacy.localTag') : t('privacy.serverTag')}</Text>
            </View>
            <Text style={styles.summary}>{t(`${base}.summary`)}</Text>
            <Text style={styles.details}>{t(`${base}.details`)}</Text>
            <Text style={styles.footer}>{t('privacy.noPersonalData')}</Text>
          </View>
        );
      })}

      <Text style={styles.contact}>{t('privacy.contact')}</Text>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  hero: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  heroTitle: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroText: {
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },
  cardTitle: {
    color: colors.accent,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  localTag: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  serverTag: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  tagText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 12,
  },
  summary: {
    color: colors.text,
    lineHeight: 20,
    marginBottom: 10,
  },
  details: {
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 10,
  },
  footer: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  contact: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
});
