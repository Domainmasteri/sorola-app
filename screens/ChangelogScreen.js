import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from '../i18n';

export default function ChangelogScreen() {
  const { t } = useTranslation();

  const entries = ['latest', 'jsonFormatter', 'grouping', 'app'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{t('changelog.title')}</Text>
        <Text style={styles.heroText}>{t('changelog.intro')}</Text>
      </View>

      {entries.map((entryKey) => {
        const base = `changelog.entries.${entryKey}`;
        const items = [t(`${base}.item1`), t(`${base}.item2`)].filter((item) => !item.endsWith('.item2'));

        return (
          <View key={entryKey} style={styles.card}>
            <Text style={styles.date}>{t(`${base}.date`)}</Text>
            <Text style={styles.title}>{t(`${base}.title`)}</Text>
            <View style={styles.list}>
              {items.map((item, index) => (
                <Text key={`${entryKey}-${index}`} style={styles.listItem}>• {item}</Text>
              ))}
            </View>
          </View>
        );
      })}
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
  date: {
    color: '#ffaa00',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    color: '#e2e8f0',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  list: { gap: 8 },
  listItem: {
    color: '#a0aec0',
    lineHeight: 20,
  },
});
