import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '../i18n';

export default function PrivacyScreen() {
  const { t } = useTranslation();

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

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  hero: {
    backgroundColor: '#191f2d',
    borderWidth: 1,
    borderColor: '#2d3748',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  heroTitle: {
    color: '#ffaa00',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroText: {
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#191f2d',
    borderWidth: 1,
    borderColor: '#2d3748',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#ffaa00',
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
    color: '#e2e8f0',
    fontWeight: 'bold',
    fontSize: 12,
  },
  summary: {
    color: '#e2e8f0',
    lineHeight: 20,
    marginBottom: 10,
  },
  details: {
    color: '#a0aec0',
    lineHeight: 20,
    marginBottom: 10,
  },
  footer: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
  contact: {
    color: '#a0aec0',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
});
