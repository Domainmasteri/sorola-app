import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { useTranslation } from '../i18n';

export default function ToolHelpScreen({ navigation }) {
  const { t } = useTranslation();

  const basicTools = [
    {
      id: 'Shortener',
      title: t('home.tools.shortenerTitle'),
      description: t('help.tools.shortener.description'),
      steps: [
        t('help.tools.shortener.step1'),
        t('help.tools.shortener.step2'),
        t('help.tools.shortener.step3'),
      ],
    },
    {
      id: 'Pastebin',
      title: t('home.tools.pastebinTitle'),
      description: t('help.tools.pastebin.description'),
      steps: [
        t('help.tools.pastebin.step1'),
        t('help.tools.pastebin.step2'),
        t('help.tools.pastebin.step3'),
      ],
    },
    {
      id: 'QR',
      title: t('home.tools.qrTitle'),
      description: t('help.tools.qr.description'),
      steps: [
        t('help.tools.qr.step1'),
        t('help.tools.qr.step2'),
        t('help.tools.qr.step3'),
      ],
    },
    {
      id: 'Share',
      title: t('home.tools.shareTitle'),
      description: t('help.tools.share.description'),
      steps: [
        t('help.tools.share.step1'),
        t('help.tools.share.step2'),
        t('help.tools.share.step3'),
      ],
    },
    {
      id: 'Password',
      title: t('home.tools.passwordTitle'),
      description: t('help.tools.password.description'),
      steps: [
        t('help.tools.password.step1'),
        t('help.tools.password.step2'),
        t('help.tools.password.step3'),
      ],
    },
    {
      id: 'Vaultwarden',
      title: t('home.tools.vaultwardenTitle'),
      description: t('help.tools.vaultwarden.description'),
      steps: [
        t('help.tools.vaultwarden.step1'),
        t('help.tools.vaultwarden.step2'),
        t('help.tools.vaultwarden.step3'),
      ],
      url: 'https://vault.sorola.fi/',
    },
    {
      id: 'Download',
      title: t('home.tools.downloadAppTitle'),
      description: t('help.tools.download.description'),
      steps: [
        t('help.tools.download.step1'),
        t('help.tools.download.step2'),
        t('help.tools.download.step3'),
      ],
      url: 'https://soro.la/sovellus',
    },
  ];

  const advancedTools = [
    {
      id: 'JsonFormatter',
      title: t('home.tools.jsonFormatterTitle'),
      description: t('help.tools.jsonFormatter.description'),
      steps: [
        t('help.tools.jsonFormatter.step1'),
        t('help.tools.jsonFormatter.step2'),
        t('help.tools.jsonFormatter.step3'),
      ],
    },
    {
      id: 'Base64',
      title: t('home.tools.base64Title'),
      description: t('help.tools.base64.description'),
      steps: [
        t('help.tools.base64.step1'),
        t('help.tools.base64.step2'),
        t('help.tools.base64.step3'),
      ],
    },
  ];

  const openTool = (tool) => {
    if (tool.url) {
      Linking.openURL(tool.url);
      return;
    }

    navigation.navigate(tool.id);
  };

  const renderSection = (title, description, tools) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>

      {tools.map((tool) => (
        <View key={tool.id} style={styles.card}>
          <Text style={styles.cardTitle}>{tool.title}</Text>
          <Text style={styles.cardDescription}>{tool.description}</Text>

          <View style={styles.steps}>
            {tool.steps.map((step, index) => (
              <Text key={`${tool.id}-${index}`} style={styles.stepText}>
                {index + 1}. {step}
              </Text>
            ))}
          </View>

          <TouchableOpacity style={styles.openBtn} onPress={() => openTool(tool)}>
            <Text style={styles.openBtnText}>{t('help.openTool')}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{t('help.title')}</Text>
        <Text style={styles.heroText}>{t('help.intro')}</Text>
      </View>

      {renderSection(t('home.basicToolsTitle'), t('home.basicToolsDesc'), basicTools)}
      {renderSection(t('home.advancedToolsTitle'), t('home.advancedToolsDesc'), advancedTools)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ffaa00',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionDescription: {
    color: '#a0aec0',
    marginBottom: 12,
    lineHeight: 20,
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
  cardDescription: {
    color: '#e2e8f0',
    lineHeight: 20,
    marginBottom: 12,
  },
  steps: {
    gap: 8,
    marginBottom: 15,
  },
  stepText: {
    color: '#a0aec0',
    lineHeight: 20,
  },
  openBtn: {
    backgroundColor: '#ffaa00',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  openBtnText: {
    color: '#0b0d13',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
